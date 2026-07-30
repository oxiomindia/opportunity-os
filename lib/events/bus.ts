import type {
  EventBusDiagnostics,
  EventDeliveryStatus,
  EventFilter,
  EventHandler,
  EventLogEntry,
  PlatformEvent,
  PublishInput,
  PublishResult,
  Subscription,
  SubscriptionFailure,
} from './types';

const MAX_LOG_ENTRIES = 200;

interface InternalSubscription {
  id: string;
  eventName: string;
  filter?: EventFilter;
  handler: EventHandler<never>;
}

/**
 * EventBus -- in-process publish/subscribe so engines can communicate
 * through published events instead of depending on each other directly.
 * Framework-agnostic and engine-agnostic: this file has zero knowledge of
 * any specific engine or event name. See lib/events/README.md.
 *
 * A class rather than the module-level-map pattern lib/engine/registry.ts
 * uses: tests need independent buses that don't share state with each
 * other or with production code, and a future caller wanting a scoped bus
 * (e.g. per-organization) can construct one without this file changing.
 * `eventBus` below is the one shared instance production code uses.
 *
 * publish() is already async and handlers may return a Promise, so
 * dispatch can move from the current synchronous-per-subscriber loop to a
 * queue or worker later without changing this class's public signatures.
 */
export class EventBus {
  private subscriptions = new Map<string, InternalSubscription>();
  private log: EventLogEntry[] = [];
  private totalPublished = 0;
  private nextSubscriptionId = 1;

  /** eventName is the exact name to match, or '*' to receive every event. */
  subscribe<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>, filter?: EventFilter): () => void {
    if (!eventName) {
      throw new Error('subscribe requires a non-empty eventName (use "*" to subscribe to every event).');
    }
    const id = `sub_${this.nextSubscriptionId++}`;
    this.subscriptions.set(id, { id, eventName, filter, handler: handler as EventHandler<never> });
    return () => this.unsubscribe(id);
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  listSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values()).map((subscription) => ({
      id: subscription.id,
      eventName: subscription.eventName,
      filter: subscription.filter,
    }));
  }

  async publish<TPayload = unknown>(input: PublishInput<TPayload>): Promise<PublishResult<TPayload>> {
    if (!input.eventName) {
      throw new Error('publish requires a non-empty eventName.');
    }
    if (!input.sourceEngine) {
      throw new Error('publish requires a non-empty sourceEngine.');
    }

    const eventId = randomId('evt');
    const event: PlatformEvent<TPayload> = {
      eventId,
      eventName: input.eventName,
      eventType: input.eventType ?? 'domain-event',
      sourceEngine: input.sourceEngine,
      timestamp: new Date().toISOString(),
      correlationId: input.correlationId ?? eventId,
      version: input.version ?? '1.0.0',
      payload: input.payload,
      metadata: input.metadata,
    };

    const matching = Array.from(this.subscriptions.values()).filter((subscription) => matches(subscription, event));

    const failed: SubscriptionFailure[] = [];
    let delivered = 0;
    for (const subscription of matching) {
      try {
        // Sequential, not concurrent: keeps error isolation simple to reason
        // about (one slow/failing handler can't race another's side
        // effects) while still letting every handler be async.
        await subscription.handler(event as PlatformEvent<never>);
        delivered += 1;
      } catch (error) {
        failed.push({ subscriptionId: subscription.id, error: error instanceof Error ? error.message : String(error) });
      }
    }

    const status: EventDeliveryStatus =
      matching.length === 0 ? 'no-subscribers' : failed.length === 0 ? 'delivered' : delivered === 0 ? 'failed' : 'partial-failure';

    this.totalPublished += 1;
    this.log.unshift({
      eventId: event.eventId,
      eventName: event.eventName,
      sourceEngine: event.sourceEngine,
      timestamp: event.timestamp,
      correlationId: event.correlationId,
      status,
    });
    if (this.log.length > MAX_LOG_ENTRIES) {
      this.log.length = MAX_LOG_ENTRIES;
    }

    return { event, deliveredTo: delivered, failed, status };
  }

  getDiagnostics(): EventBusDiagnostics {
    return {
      totalPublished: this.totalPublished,
      totalSubscriptions: this.subscriptions.size,
      recentEvents: [...this.log],
    };
  }

  /** Test-only: reset all state between test runs. Not intended for
   * production use. */
  clearForTests(): void {
    this.subscriptions.clear();
    this.log = [];
    this.totalPublished = 0;
    this.nextSubscriptionId = 1;
  }
}

function matches(subscription: InternalSubscription, event: PlatformEvent): boolean {
  if (subscription.eventName !== '*' && subscription.eventName !== event.eventName) return false;
  if (subscription.filter?.eventType && subscription.filter.eventType !== event.eventType) return false;
  if (subscription.filter?.sourceEngine && subscription.filter.sourceEngine !== event.sourceEngine) return false;
  return true;
}

function randomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** The one shared Event Bus production code publishes to and subscribes
 * on. See lib/events/README.md for how engines use it. */
export const eventBus = new EventBus();
