import { after } from 'next/server';
import { eventBus } from '../events/bus';
import { deliverEvent } from './delivery';
import { findSubscribedEndpoints } from './subscriptions';
import type { PlatformEvent } from '../events/types';

/**
 * The one place that connects the Event Bus to the Webhook Engine:
 *
 *   Engine -> Event Bus -> Webhook Engine -> External Endpoint
 *
 * Subscribing to '*' means every current and future publisher (engines,
 * URP, anything else that ever calls eventBus.publish) reaches subscribed
 * webhook endpoints automatically. Nothing outside lib/webhooks/ imports
 * anything from it -- "must not require engines to know anything about
 * webhooks" is true structurally, not just by convention.
 */
let unsubscribe: (() => void) | undefined;

export function ensureWebhookDispatchSubscribed(): void {
  if (unsubscribe) return;
  unsubscribe = eventBus.subscribe('*', handleEvent);
}

async function handleEvent(event: PlatformEvent): Promise<void> {
  const endpoints = findSubscribedEndpoints(event);
  for (const endpoint of endpoints) {
    const endpointId = endpoint.id;
    // Fire-and-forget from the Event Bus's point of view: EventBus.publish
    // awaits each subscriber handler in turn (lib/events/bus.ts), so
    // actually awaiting delivery here -- a real network call, possibly
    // several retries -- would make every publish() anywhere on the
    // platform as slow as the slowest webhook endpoint. Scheduling the
    // real delivery via runAfterResponse instead keeps publish() fast
    // while still letting the delivery complete.
    runAfterResponse(() => deliverEvent(endpointId, event));
  }
}

/**
 * Prefers Next's after() (docs/01-app/03-api-reference/04-functions/after.md)
 * so delivery survives past the response in a serverless invocation
 * (Vercel's waitUntil under the hood) when called from a real request or
 * prerender. after() throws when there is no such request scope -- true
 * for plain unit tests and any non-request call site -- so this falls
 * back to a plain detached microtask there; still non-blocking, just
 * without the serverless-lifetime guarantee a live request doesn't need
 * anyway.
 */
function runAfterResponse(task: () => Promise<unknown>): void {
  try {
    after(task);
  } catch {
    void task().catch((error) => {
      console.error('Webhook delivery task failed outside a request scope', error instanceof Error ? error.message : error);
    });
  }
}

/** Test-only: undoes ensureWebhookDispatchSubscribed so tests can
 * re-subscribe against fresh state. Not intended for production use. */
export function resetDispatchSubscriptionForTests(): void {
  unsubscribe?.();
  unsubscribe = undefined;
}
