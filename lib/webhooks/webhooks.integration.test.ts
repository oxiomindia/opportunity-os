import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { eventBus } from '../events/bus';
import { clearRegistryForTests, getEndpointForDelivery, registerEndpoint } from './registry';
import { clearDeliveryStateForTests, getDeliveryHistory } from './delivery';
import { ensureWebhookDispatchSubscribed, resetDispatchSubscriptionForTests } from './dispatcher';
import { verifySignature } from './signing';

/**
 * The only test in this file exercises the full required flow for real,
 * with no mocks anywhere in the path:
 *
 *   Engine (simulated: a direct eventBus.publish call, exactly what
 *   ItcRecoveryEngine/BillsEngine/CommercialEngine and URP's
 *   generateReport already do) -> Event Bus -> Webhook Engine (dispatcher
 *   + delivery + real HMAC signing) -> External Endpoint (a real local
 *   HTTP server on the loopback interface, receiving a real fetch() POST).
 *
 * The receiving server verifies the signature itself with the same
 * verifySignature() a real customer endpoint would use -- proving the
 * sender and a reference receiver agree, not just that the sender didn't
 * throw.
 */
test('Engine -> Event Bus -> Webhook Engine -> External Endpoint delivers a genuinely signed, verifiable webhook', async () => {
  clearRegistryForTests();
  clearDeliveryStateForTests();
  resetDispatchSubscriptionForTests();
  eventBus.clearForTests();

  let received: { headers: Record<string, string | string[] | undefined>; body: string } | undefined;
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      received = { headers: request.headers, body: Buffer.concat(chunks).toString('utf8') };
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ received: true }));
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const url = `http://127.0.0.1:${port}/webhook`;

  try {
    const endpoint = registerEndpoint({ url, eventFilters: ['order.paid'] });
    ensureWebhookDispatchSubscribed();

    const publishResult = await eventBus.publish({
      eventName: 'order.paid',
      sourceEngine: 'test-engine',
      payload: { orderId: 'ord_123', amount: 4999 },
    });

    // handleEvent schedules real delivery via runAfterResponse rather
    // than awaiting it inline (see dispatcher.ts) -- publish() itself
    // must not block on network I/O, so this test waits for the
    // detached delivery task the same way a real caller would: by
    // observing its effect (the server receiving the request), not by
    // awaiting publish().
    await waitFor(() => received !== undefined, 2000);

    assert.ok(received, 'the local HTTP server should have received a request');
    const signatureHeader = received!.headers['x-oxiom-signature'];
    assert.equal(typeof signatureHeader, 'string');

    const storedEndpoint = getEndpointForDelivery(endpoint.id);
    assert.ok(storedEndpoint);
    const verification = verifySignature(storedEndpoint!.secret, received!.body, signatureHeader as string);
    assert.deepEqual(verification, { ok: true }, 'the receiver must be able to verify the signature with the endpoint\'s own secret');

    const deliveredEvent = JSON.parse(received!.body);
    assert.equal(deliveredEvent.eventName, 'order.paid');
    assert.equal(deliveredEvent.eventId, publishResult.event.eventId);
    assert.deepEqual(deliveredEvent.payload, { orderId: 'ord_123', amount: 4999 });

    await waitFor(() => getDeliveryHistory(endpoint.id).some((attempt) => attempt.status === 'success'), 2000);
    const history = getDeliveryHistory(endpoint.id);
    assert.equal(history.length, 1);
    assert.equal(history[0].status, 'success');
    assert.equal(history[0].httpStatus, 200);
  } finally {
    resetDispatchSubscriptionForTests();
    await new Promise((resolve) => server.close(resolve));
  }
});

async function waitFor(condition: () => boolean, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error('waitFor: condition was not met before the timeout');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
