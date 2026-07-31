import type { WebhookDeliveryProvider, WebhookDeliveryRequest, WebhookDeliveryProviderResult } from './types';

/**
 * The one seam between the Webhook Engine and the network. Delivery logic
 * (lib/webhooks/delivery.ts) depends only on this interface, never on
 * `fetch` directly -- "keep transport providers abstract." Production uses
 * FetchDeliveryProvider; tests inject a fake (see delivery.test.ts) for
 * deterministic failure injection, and the integration test
 * (webhooks.integration.test.ts) uses this exact real provider against a
 * real local HTTP server to prove the whole path end to end.
 */
export class FetchDeliveryProvider implements WebhookDeliveryProvider {
  constructor(private readonly timeoutMs: number = 10_000) {}

  async send(request: WebhookDeliveryRequest): Promise<WebhookDeliveryProviderResult> {
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(request.url, {
        method: 'POST',
        headers: request.headers,
        body: request.body,
        signal: controller.signal,
      });
      return { ok: true, status: response.status, durationMs: performance.now() - startedAt };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error), durationMs: performance.now() - startedAt };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const fetchDeliveryProvider = new FetchDeliveryProvider();
