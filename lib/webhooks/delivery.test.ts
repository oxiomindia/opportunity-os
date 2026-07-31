import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import {
  clearDeliveryStateForTests,
  computeEndpointMetrics,
  deliverEvent,
  getDeadLetterQueue,
  getDeliveryHistory,
  getEndpointDiagnostics,
  getRetryQueue,
  processRetryQueue,
} from './delivery';
import { clearRegistryForTests, registerEndpoint } from './registry';
import type { WebhookDeliveryProvider, WebhookDeliveryProviderResult, WebhookDeliveryRequest } from './types';
import type { PlatformEvent } from '../events/types';

function makeEvent(eventName = 'test.event', overrides: Partial<PlatformEvent> = {}): PlatformEvent {
  return {
    eventId: randomUUID(),
    eventName,
    eventType: 'domain-event',
    sourceEngine: 'test',
    timestamp: new Date().toISOString(),
    correlationId: randomUUID(),
    version: '1.0.0',
    payload: { hello: 'world' },
    ...overrides,
  };
}

class ScriptedProvider implements WebhookDeliveryProvider {
  private index = 0;
  public readonly requests: WebhookDeliveryRequest[] = [];
  constructor(public readonly results: WebhookDeliveryProviderResult[]) {}
  async send(request: WebhookDeliveryRequest): Promise<WebhookDeliveryProviderResult> {
    this.requests.push(request);
    const result = this.results[Math.min(this.index, this.results.length - 1)];
    this.index += 1;
    return result;
  }
}

function reset() {
  clearRegistryForTests();
  clearDeliveryStateForTests();
}

test('a successful delivery is recorded with status "success" and the real HTTP status/duration', async () => {
  reset();
  const endpoint = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['*'] });
  const provider = new ScriptedProvider([{ ok: true, status: 200, durationMs: 42 }]);

  const attempt = await deliverEvent(endpoint.id, makeEvent(), { provider });

  assert.equal(attempt.status, 'success');
  assert.equal(attempt.httpStatus, 200);
  assert.equal(attempt.durationMs, 42);
  assert.equal(attempt.attemptNumber, 1);
  assert.deepEqual(getDeliveryHistory(endpoint.id), [attempt]);
});

test('the delivered request is signed with headers verifySignature-shaped tests expect', async () => {
  reset();
  const endpoint = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['*'] });
  const provider = new ScriptedProvider([{ ok: true, status: 200, durationMs: 1 }]);
  const event = makeEvent('order.paid');

  await deliverEvent(endpoint.id, event, { provider });

  const [request] = provider.requests;
  assert.equal(request.url, 'https://example.com/hook');
  assert.equal(request.headers['X-Oxiom-Event'], 'order.paid');
  assert.equal(request.headers['X-Oxiom-Event-Id'], event.eventId);
  assert.match(request.headers['X-Oxiom-Signature'], /^t=\d+,v1=[0-9a-f]{64}$/);
  assert.equal(request.body, JSON.stringify(event));
});

test('deliverEvent is idempotent for the same (endpoint, event) pair -- the provider is called only once', async () => {
  reset();
  const endpoint = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['*'] });
  const provider = new ScriptedProvider([{ ok: true, status: 200, durationMs: 1 }]);
  const event = makeEvent();

  const first = await deliverEvent(endpoint.id, event, { provider });
  const second = await deliverEvent(endpoint.id, event, { provider });

  assert.equal(provider.requests.length, 1);
  assert.equal(second.id, first.id);
});

test('a failed delivery with retries remaining is queued with an exponentially-backed-off nextRetryAt', async () => {
  reset();
  const endpoint = registerEndpoint({
    url: 'https://example.com/hook',
    eventFilters: ['*'],
    retryPolicy: { maxAttempts: 3, initialDelayMs: 1000, maxDelayMs: 60_000 },
  });
  const provider = new ScriptedProvider([{ ok: false, error: 'connection refused', durationMs: 5 }]);
  const clock = 1_000_000;

  const attempt = await deliverEvent(endpoint.id, makeEvent(), { provider, now: () => clock });

  assert.equal(attempt.status, 'pending');
  assert.equal(attempt.error, 'connection refused');
  assert.ok(attempt.nextRetryAt);
  assert.ok(new Date(attempt.nextRetryAt!).getTime() > clock, 'nextRetryAt must be in the future relative to the injected clock');
  assert.equal(getRetryQueue().length, 1);
  assert.equal(getDeadLetterQueue().length, 0);
});

test('processRetryQueue only re-attempts entries whose nextRetryAt has passed, and retries succeed', async () => {
  reset();
  const endpoint = registerEndpoint({
    url: 'https://example.com/hook',
    eventFilters: ['*'],
    retryPolicy: { maxAttempts: 3, initialDelayMs: 1000, maxDelayMs: 60_000 },
  });
  const provider = new ScriptedProvider([{ ok: false, error: 'timeout', durationMs: 5 }]);
  let clock = 1_000_000;

  await deliverEvent(endpoint.id, makeEvent(), { provider, now: () => clock });
  assert.equal(getRetryQueue().length, 1);

  const tooEarly = await processRetryQueue({ provider, now: () => clock });
  assert.deepEqual(tooEarly, []);
  assert.equal(getRetryQueue().length, 1, 'the queued entry must still be pending before its nextRetryAt');

  provider.results.push({ ok: true, status: 200, durationMs: 3 });
  clock += 120_000; // well past any capped backoff for this policy
  const due = await processRetryQueue({ provider, now: () => clock });

  assert.equal(due.length, 1);
  assert.equal(due[0].status, 'success');
  assert.equal(due[0].attemptNumber, 2);
  assert.equal(getRetryQueue().length, 0);
});

test('exhausting every retry attempt moves the delivery to the Dead Letter Queue instead of retrying forever', async () => {
  reset();
  const endpoint = registerEndpoint({
    url: 'https://example.com/hook',
    eventFilters: ['*'],
    retryPolicy: { maxAttempts: 2, initialDelayMs: 100, maxDelayMs: 200 },
  });
  const provider = new ScriptedProvider([
    { ok: false, error: 'first failure', durationMs: 1 },
    { ok: false, error: 'second failure', durationMs: 1 },
  ]);
  let clock = 1_000_000;

  const first = await deliverEvent(endpoint.id, makeEvent(), { provider, now: () => clock });
  assert.equal(first.status, 'pending');
  assert.equal(getRetryQueue().length, 1);
  assert.equal(getDeadLetterQueue().length, 0);

  clock += 10_000;
  const [second] = await processRetryQueue({ provider, now: () => clock });

  assert.equal(second.status, 'exhausted');
  assert.equal(second.attemptNumber, 2);
  assert.equal(getRetryQueue().length, 0);
  assert.equal(getDeadLetterQueue().length, 1);
  assert.equal(getDeadLetterQueue()[0].id, second.id);
});

test('delivering to an endpoint id that does not exist fails cleanly without throwing', async () => {
  reset();
  const attempt = await deliverEvent('does-not-exist', makeEvent(), { provider: new ScriptedProvider([]) });
  assert.equal(attempt.status, 'failed');
  assert.equal(attempt.error, 'endpoint not found');
});

test('computeEndpointMetrics reports success rate, average delivery time over successes, and last delivery', async () => {
  reset();
  const endpoint = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['*'] });

  await deliverEvent(endpoint.id, makeEvent('a'), { provider: new ScriptedProvider([{ ok: true, status: 200, durationMs: 100 }]) });
  await deliverEvent(endpoint.id, makeEvent('b'), { provider: new ScriptedProvider([{ ok: true, status: 200, durationMs: 200 }]) });
  await deliverEvent(endpoint.id, makeEvent('c'), {
    provider: new ScriptedProvider([{ ok: false, error: 'nope', durationMs: 5 }]),
  });

  const metrics = computeEndpointMetrics(endpoint.id);
  assert.equal(metrics.totalDeliveries, 2, 'a "pending" (still-retrying) attempt is not yet terminal and must not count as a completed delivery');
  assert.equal(metrics.successCount, 2);
  assert.equal(metrics.failureCount, 0);
  assert.equal(metrics.successRate, 100);
  assert.equal(metrics.averageDeliveryTimeMs, 150);
});

test('getEndpointDiagnostics composes the endpoint, its metrics, recent deliveries, and pending retries', async () => {
  reset();
  const endpoint = registerEndpoint({
    url: 'https://example.com/hook',
    eventFilters: ['*'],
    retryPolicy: { maxAttempts: 3, initialDelayMs: 1000, maxDelayMs: 60_000 },
  });
  await deliverEvent(endpoint.id, makeEvent(), { provider: new ScriptedProvider([{ ok: false, error: 'down', durationMs: 1 }]) });

  const diagnostics = getEndpointDiagnostics(endpoint.id);
  assert.ok(diagnostics);
  assert.equal(diagnostics?.endpoint.id, endpoint.id);
  assert.equal(diagnostics?.recentDeliveries.length, 1);
  assert.equal(diagnostics?.pendingRetries.length, 1);
  assert.equal(getEndpointDiagnostics('does-not-exist'), undefined);
});
