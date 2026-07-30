/**
 * Platform Event Bus -- shared contract types.
 *
 * This module defines what "an event" is on the Oxiom platform and has no
 * knowledge of any specific engine or event name -- see lib/events/README.md
 * for the full model and how an engine publishes/subscribes.
 */

export type EventId = string;
export type EventName = string;
export type CorrelationId = string;

/** Standardized metadata every published event carries, regardless of
 * payload shape. */
export interface EventMetadata {
  eventId: EventId;
  eventName: EventName;
  /** A coarse category ('domain-event', 'lifecycle', etc.) -- free-form
   * because the bus must not hardcode the set of event types a future
   * engine can declare. Defaults to 'domain-event' when not supplied. */
  eventType: string;
  sourceEngine: string;
  timestamp: string;
  /** Ties related events together across engines. Defaults to the event's
   * own eventId when the publisher doesn't supply one, so a single,
   * unrelated event still has a valid, stable correlation id. */
  correlationId: CorrelationId;
  /** Event schema version, not engine version -- lets a future subscriber
   * handle multiple payload shapes for the same eventName. */
  version: string;
}

/** A fully-formed event as delivered to subscribers. Strongly typed by
 * payload via the generic so a subscriber for a known eventName gets a
 * typed payload rather than `unknown`. */
export interface PlatformEvent<TPayload = unknown> extends EventMetadata {
  payload: TPayload;
  /** Free-form, non-standardized extra context (e.g. trace ids) -- distinct
   * from the standardized EventMetadata fields above. */
  metadata?: Record<string, unknown>;
}

/** What a caller provides to publish() -- the bus fills in eventId,
 * timestamp, and defaults for eventType/correlationId/version. */
export interface PublishInput<TPayload = unknown> {
  eventName: EventName;
  sourceEngine: string;
  payload: TPayload;
  eventType?: string;
  correlationId?: CorrelationId;
  version?: string;
  metadata?: Record<string, unknown>;
}

/** Narrows which events a subscription receives beyond eventName matching. */
export interface EventFilter {
  eventType?: string;
  sourceEngine?: string;
}

export type EventHandler<TPayload = unknown> = (event: PlatformEvent<TPayload>) => void | Promise<void>;

/** The public (handler-free) view of a subscription, e.g. for diagnostics. */
export interface Subscription {
  id: string;
  /** The exact eventName subscribed to, or '*' for every event. */
  eventName: EventName;
  filter?: EventFilter;
}

export interface SubscriptionFailure {
  subscriptionId: string;
  error: string;
}

export type EventDeliveryStatus = 'delivered' | 'partial-failure' | 'failed' | 'no-subscribers';

export interface PublishResult<TPayload = unknown> {
  event: PlatformEvent<TPayload>;
  deliveredTo: number;
  failed: SubscriptionFailure[];
  status: EventDeliveryStatus;
}

/** What the read-only Event Monitor (Admin Console) renders per row. */
export interface EventLogEntry {
  eventId: EventId;
  eventName: EventName;
  sourceEngine: string;
  timestamp: string;
  correlationId: CorrelationId;
  status: EventDeliveryStatus;
}

export interface EventBusDiagnostics {
  totalPublished: number;
  totalSubscriptions: number;
  /** Bounded, most-recent-first. See EventBus's MAX_LOG_ENTRIES. */
  recentEvents: EventLogEntry[];
}
