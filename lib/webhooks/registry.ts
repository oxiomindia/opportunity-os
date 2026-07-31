import { randomUUID } from 'node:crypto';
import { generateWebhookSecret } from './signing';
import { DEFAULT_RETRY_POLICY } from './types';
import type { RegisterWebhookEndpointInput, WebhookEndpoint, WebhookEndpointSummary, WebhookId, WebhookStatus } from './types';

/**
 * The Endpoint Registry: a single in-process map, mirroring
 * lib/engine/registry.ts and lib/urp/registry.ts. Not database-backed in
 * this milestone, for the same reason those two aren't: prove the
 * mechanism before adding persistence (see lib/webhooks/README.md).
 *
 * Unlike engines and reports, webhook endpoints aren't code -- there's no
 * module to self-register at import time. This registry is a runtime
 * CRUD store instead (register/list/get/updateStatus/rotateSecret),
 * exactly the shape a future persistence layer would replace behind the
 * same functions.
 */
const endpoints = new Map<WebhookId, WebhookEndpoint>();

function toSummary(endpoint: WebhookEndpoint): WebhookEndpointSummary {
  const { secret: _secret, ...summary } = endpoint;
  void _secret;
  return summary;
}

export function registerEndpoint(input: RegisterWebhookEndpointInput): WebhookEndpointSummary {
  const now = new Date().toISOString();
  const endpoint: WebhookEndpoint = {
    id: randomUUID(),
    url: input.url,
    secret: input.secret ?? generateWebhookSecret(),
    status: 'active',
    version: 1,
    eventFilters: input.eventFilters,
    retryPolicy: { ...DEFAULT_RETRY_POLICY, ...input.retryPolicy },
    secretStatus: { version: 1, rotatedAt: now },
    createdAt: now,
    updatedAt: now,
  };
  endpoints.set(endpoint.id, endpoint);
  return toSummary(endpoint);
}

export function listEndpoints(): WebhookEndpointSummary[] {
  return Array.from(endpoints.values()).map(toSummary);
}

export function getEndpoint(id: WebhookId): WebhookEndpointSummary | undefined {
  const endpoint = endpoints.get(id);
  return endpoint ? toSummary(endpoint) : undefined;
}

/** Internal to delivery (lib/webhooks/delivery.ts), which needs the real
 * secret to sign a request. Never exposed to the Admin Console. */
export function getEndpointForDelivery(id: WebhookId): WebhookEndpoint | undefined {
  return endpoints.get(id);
}

export function updateEndpointStatus(id: WebhookId, status: WebhookStatus): WebhookEndpointSummary | undefined {
  const endpoint = endpoints.get(id);
  if (!endpoint) return undefined;
  endpoint.status = status;
  endpoint.updatedAt = new Date().toISOString();
  return toSummary(endpoint);
}

/** Secret Rotation: issues a new secret and bumps secretStatus.version.
 * The old secret stops working immediately -- there is no overlap/grace
 * window in this milestone (a real rotation flow would need one; not
 * built here, see README's "what's deliberately not here"). */
export function rotateSecret(id: WebhookId): WebhookEndpointSummary | undefined {
  const endpoint = endpoints.get(id);
  if (!endpoint) return undefined;
  const now = new Date().toISOString();
  endpoint.secret = generateWebhookSecret();
  endpoint.secretStatus = { version: endpoint.secretStatus.version + 1, rotatedAt: now };
  endpoint.updatedAt = now;
  return toSummary(endpoint);
}

/** Test-only: not intended for production use. */
export function clearRegistryForTests(): void {
  endpoints.clear();
}
