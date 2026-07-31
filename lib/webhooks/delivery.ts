import { randomUUID } from 'node:crypto';
import { computeBackoffDelayMs, hasRetriesRemaining } from './backoff';
import { getEndpoint, getEndpointForDelivery } from './registry';
import { buildDeliveryHeaders } from './signing';
import { fetchDeliveryProvider } from './provider';
import type { DeliveryAttempt, EndpointDiagnostics, EndpointMetrics, WebhookDeliveryProvider, WebhookId } from './types';
import type { PlatformEvent } from '../events/types';

/**
 * Delivery: one attempt at a time, retry scheduling, delivery history, a
 * Dead Letter Queue for exhausted attempts, idempotency, and the metrics
 * the Admin Console reads. This is the only module that calls
 * computeBackoffDelayMs ("avoid duplicate retry logic") and
 * buildDeliveryHeaders ("avoid duplicate signing logic") for an actual
 * outbound send -- lib/webhooks/dispatcher.ts is the only caller of
 * deliverEvent, and processRetryQueue is what a future scheduler (or, in
 * this milestone, a test / the internal cron route) advances.
 */

const MAX_HISTORY_ENTRIES = 500;
const MAX_DEAD_LETTER_ENTRIES = 500;
const MAX_DEDUPE_KEYS = 2000;

interface QueuedRetry {
  attempt: DeliveryAttempt;
  endpointId: WebhookId;
  event: PlatformEvent;
  nextRetryAtMs: number;
}

const history: DeliveryAttempt[] = []; // most-recent-first, bounded
const deadLetterQueue: DeliveryAttempt[] = []; // most-recent-first, bounded
const retryQueue: QueuedRetry[] = [];
/** Idempotency: once an (endpointId, eventId) pair starts delivering,
 * skip a duplicate dispatch for that exact pair rather than starting a
 * second, independent delivery/retry chain for the same underlying
 * platform event. */
const dedupeKeys = new Set<string>();

export interface DeliverOptions {
  provider?: WebhookDeliveryProvider;
  /** Epoch ms; injectable so retry-scheduling tests don't depend on real
   * wall-clock time. */
  now?: () => number;
}

function dedupeKey(endpointId: WebhookId, eventId: string): string {
  return `${endpointId}:${eventId}`;
}

function markDedupe(key: string): void {
  dedupeKeys.add(key);
  if (dedupeKeys.size > MAX_DEDUPE_KEYS) {
    const oldest = dedupeKeys.values().next().value;
    if (oldest !== undefined) dedupeKeys.delete(oldest);
  }
}

function recordHistory(attempt: DeliveryAttempt): void {
  history.unshift(attempt);
  if (history.length > MAX_HISTORY_ENTRIES) history.length = MAX_HISTORY_ENTRIES;
}

function recordDeadLetter(attempt: DeliveryAttempt): void {
  deadLetterQueue.unshift(attempt);
  if (deadLetterQueue.length > MAX_DEAD_LETTER_ENTRIES) deadLetterQueue.length = MAX_DEAD_LETTER_ENTRIES;
}

/**
 * Entry point for a fresh event: dispatcher.ts calls this once per
 * (endpoint, event) match. Idempotent -- a second call for the same pair
 * returns the existing attempt instead of delivering twice.
 */
export async function deliverEvent(endpointId: WebhookId, event: PlatformEvent, options: DeliverOptions = {}): Promise<DeliveryAttempt> {
  const key = dedupeKey(endpointId, event.eventId);
  if (dedupeKeys.has(key)) {
    const existing = history.find((attempt) => attempt.endpointId === endpointId && attempt.eventId === event.eventId);
    if (existing) return existing;
    // Marked as dispatched but no history entry recorded yet -- a
    // concurrent call for the exact same pair. Report pending rather than
    // starting a second delivery chain.
    return {
      id: randomUUID(),
      deliveryId: key,
      endpointId,
      eventId: event.eventId,
      eventName: event.eventName,
      attemptNumber: 1,
      status: 'pending',
      attemptedAt: new Date().toISOString(),
    };
  }
  markDedupe(key);
  return attemptDelivery(endpointId, event, 1, options);
}

async function attemptDelivery(endpointId: WebhookId, event: PlatformEvent, attemptNumber: number, options: DeliverOptions): Promise<DeliveryAttempt> {
  const now = options.now ?? Date.now;
  const deliveryId = dedupeKey(endpointId, event.eventId);
  const endpoint = getEndpointForDelivery(endpointId);

  if (!endpoint) {
    const attempt: DeliveryAttempt = {
      id: randomUUID(),
      deliveryId,
      endpointId,
      eventId: event.eventId,
      eventName: event.eventName,
      attemptNumber,
      status: 'failed',
      error: 'endpoint not found',
      attemptedAt: new Date(now()).toISOString(),
    };
    recordHistory(attempt);
    return attempt;
  }

  const provider = options.provider ?? fetchDeliveryProvider;
  const body = JSON.stringify(event);
  const headers = buildDeliveryHeaders({ secret: endpoint.secret, deliveryId, eventId: event.eventId, eventName: event.eventName, body });
  const result = await provider.send({ url: endpoint.url, headers, body });
  const attemptedAt = new Date(now()).toISOString();

  if (result.ok && result.status >= 200 && result.status < 300) {
    const attempt: DeliveryAttempt = {
      id: randomUUID(),
      deliveryId,
      endpointId,
      eventId: event.eventId,
      eventName: event.eventName,
      attemptNumber,
      status: 'success',
      httpStatus: result.status,
      durationMs: result.durationMs,
      attemptedAt,
    };
    recordHistory(attempt);
    return attempt;
  }

  const error = result.ok ? `endpoint returned HTTP ${result.status}` : result.error;
  const httpStatus = result.ok ? result.status : undefined;

  if (hasRetriesRemaining(attemptNumber, endpoint.retryPolicy)) {
    const delayMs = computeBackoffDelayMs(attemptNumber, endpoint.retryPolicy);
    const nextRetryAtMs = now() + delayMs;
    const attempt: DeliveryAttempt = {
      id: randomUUID(),
      deliveryId,
      endpointId,
      eventId: event.eventId,
      eventName: event.eventName,
      attemptNumber,
      status: 'pending',
      httpStatus,
      durationMs: result.durationMs,
      error,
      attemptedAt,
      nextRetryAt: new Date(nextRetryAtMs).toISOString(),
    };
    recordHistory(attempt);
    retryQueue.push({ attempt, endpointId, event, nextRetryAtMs });
    return attempt;
  }

  // Retries exhausted -- Dead Letter Queue.
  const attempt: DeliveryAttempt = {
    id: randomUUID(),
    deliveryId,
    endpointId,
    eventId: event.eventId,
    eventName: event.eventName,
    attemptNumber,
    status: 'exhausted',
    httpStatus,
    durationMs: result.durationMs,
    error,
    attemptedAt,
  };
  recordHistory(attempt);
  recordDeadLetter(attempt);
  return attempt;
}

/**
 * Advances the retry queue: re-attempts every entry whose nextRetryAt has
 * passed. There is no background worker in this milestone (no cron
 * infrastructure exists in this app yet -- see README); this function is
 * what a scheduler would call, and is exactly what
 * app/api/internal/webhooks/process-queue/route.ts calls today.
 */
export async function processRetryQueue(options: DeliverOptions = {}): Promise<DeliveryAttempt[]> {
  const now = options.now ?? Date.now;
  const currentTimeMs = now();
  const due = retryQueue.filter((queued) => queued.nextRetryAtMs <= currentTimeMs);
  const remaining = retryQueue.filter((queued) => queued.nextRetryAtMs > currentTimeMs);
  retryQueue.length = 0;
  retryQueue.push(...remaining);

  const results: DeliveryAttempt[] = [];
  for (const queued of due) {
    results.push(await attemptDelivery(queued.endpointId, queued.event, queued.attempt.attemptNumber + 1, options));
  }
  return results;
}

export function getRetryQueue(): DeliveryAttempt[] {
  return retryQueue.map((queued) => queued.attempt);
}

export function getDeadLetterQueue(): DeliveryAttempt[] {
  return [...deadLetterQueue];
}

export function getDeliveryHistory(endpointId?: WebhookId): DeliveryAttempt[] {
  return endpointId ? history.filter((attempt) => attempt.endpointId === endpointId) : [...history];
}

export function computeEndpointMetrics(endpointId: WebhookId): EndpointMetrics {
  const attempts = getDeliveryHistory(endpointId);
  const terminal = attempts.filter((attempt) => attempt.status === 'success' || attempt.status === 'failed' || attempt.status === 'exhausted');
  const successes = terminal.filter((attempt) => attempt.status === 'success');
  const durations = successes.map((attempt) => attempt.durationMs).filter((duration): duration is number => duration !== undefined);
  const mostRecent = attempts[0];

  return {
    totalDeliveries: terminal.length,
    successCount: successes.length,
    failureCount: terminal.length - successes.length,
    successRate: terminal.length > 0 ? Math.round((successes.length / terminal.length) * 1000) / 10 : undefined,
    averageDeliveryTimeMs: durations.length > 0 ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length) : undefined,
    lastDeliveryAt: mostRecent?.attemptedAt,
    lastDeliveryStatus: mostRecent?.status,
  };
}

export function getEndpointDiagnostics(endpointId: WebhookId): EndpointDiagnostics | undefined {
  const endpoint = getEndpoint(endpointId);
  if (!endpoint) return undefined;
  return {
    endpoint,
    metrics: computeEndpointMetrics(endpointId),
    recentDeliveries: getDeliveryHistory(endpointId).slice(0, 20),
    pendingRetries: getRetryQueue().filter((attempt) => attempt.endpointId === endpointId),
  };
}

/** Test-only: not intended for production use. */
export function clearDeliveryStateForTests(): void {
  history.length = 0;
  deadLetterQueue.length = 0;
  retryQueue.length = 0;
  dedupeKeys.clear();
}
