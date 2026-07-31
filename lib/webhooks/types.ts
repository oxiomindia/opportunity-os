/**
 * Webhook Engine -- shared contract types.
 *
 * This module defines what "a webhook" is on the Oxiom platform. It has no
 * knowledge of any specific engine, event name, or report -- see
 * lib/webhooks/README.md for the full model.
 */

export type WebhookId = string;

export type WebhookStatus = 'active' | 'paused' | 'disabled';

/** Exponential backoff configuration -- see lib/webhooks/backoff.ts for the
 * one function that actually computes a delay from this. */
export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 5,
  initialDelayMs: 1_000,
  maxDelayMs: 60_000,
};

/** What the Admin Console shows as "Secret Status" -- never the secret
 * value itself. */
export interface SecretStatus {
  version: number;
  rotatedAt: string;
}

/**
 * A registered outbound webhook endpoint. `secret` is intentionally
 * present on this internal shape (signing needs it) but the registry's
 * read-only listing/discovery functions never return it -- see
 * lib/webhooks/registry.ts's WebhookEndpointSummary.
 */
export interface WebhookEndpoint {
  id: WebhookId;
  url: string;
  secret: string;
  status: WebhookStatus;
  version: number;
  /** Event name patterns this endpoint is subscribed to -- exact names or
   * '*' for every event, same wildcard convention as EventBus.subscribe. */
  eventFilters: string[];
  retryPolicy: RetryPolicy;
  secretStatus: SecretStatus;
  createdAt: string;
  updatedAt: string;
}

/** The read-only view the registry and Admin Console expose -- no secret
 * value, ever. */
export type WebhookEndpointSummary = Omit<WebhookEndpoint, 'secret'>;

export interface RegisterWebhookEndpointInput {
  url: string;
  eventFilters: string[];
  retryPolicy?: Partial<RetryPolicy>;
  /** Provide only in tests; production registration always generates one. */
  secret?: string;
}

export type DeliveryStatus = 'success' | 'failed' | 'pending' | 'exhausted';

/** One attempt to deliver one event to one endpoint. Multiple attempts can
 * share the same deliveryId (the value sent as X-Oxiom-Delivery-Id, and
 * the idempotency/replay-protection key) as attemptNumber increases. */
export interface DeliveryAttempt {
  id: string;
  deliveryId: string;
  endpointId: WebhookId;
  eventId: string;
  eventName: string;
  attemptNumber: number;
  status: DeliveryStatus;
  httpStatus?: number;
  durationMs?: number;
  error?: string;
  attemptedAt: string;
  nextRetryAt?: string;
}

export interface EndpointMetrics {
  totalDeliveries: number;
  successCount: number;
  failureCount: number;
  /** 0-100, undefined when there have been zero delivery attempts. */
  successRate?: number;
  averageDeliveryTimeMs?: number;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: DeliveryStatus;
}

export interface EndpointDiagnostics {
  endpoint: WebhookEndpointSummary;
  metrics: EndpointMetrics;
  recentDeliveries: DeliveryAttempt[];
  pendingRetries: DeliveryAttempt[];
}

/** What a real (or, in tests, fake) HTTP call looks like from the Webhook
 * Engine's point of view -- see lib/webhooks/provider.ts. */
export interface WebhookDeliveryRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

export type WebhookDeliveryProviderResult = { ok: true; status: number; durationMs: number } | { ok: false; error: string; durationMs: number };

export interface WebhookDeliveryProvider {
  send(request: WebhookDeliveryRequest): Promise<WebhookDeliveryProviderResult>;
}
