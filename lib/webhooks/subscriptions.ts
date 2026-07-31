import { listEndpoints } from './registry';
import type { WebhookEndpointSummary } from './types';
import type { PlatformEvent } from '../events/types';

/**
 * The Subscription Registry: distinct from the Endpoint Registry
 * (lib/webhooks/registry.ts, "which endpoints exist") -- this answers
 * "which endpoints care about this event," derived from each endpoint's
 * own eventFilters rather than tracked as a separate list, so the two can
 * never drift apart (the same principle URP's supportedFormats uses:
 * lib/urp/registry.ts).
 *
 * eventFilters entries are either an exact event name or '*' for every
 * event -- the same wildcard convention lib/events/bus.ts's own
 * subscribe() already uses, so a webhook's filter reads the same way an
 * in-process subscription does.
 */
export function matchesFilters(eventFilters: readonly string[], eventName: string): boolean {
  return eventFilters.includes('*') || eventFilters.includes(eventName);
}

/** Only 'active' endpoints receive deliveries -- 'paused' and 'disabled'
 * are excluded here so pausing an endpoint (a status flip, not a
 * subscription edit) is enough to stop delivery without touching
 * eventFilters. */
export function findSubscribedEndpoints(event: Pick<PlatformEvent, 'eventName'>): WebhookEndpointSummary[] {
  return listEndpoints().filter((endpoint) => endpoint.status === 'active' && matchesFilters(endpoint.eventFilters, event.eventName));
}
