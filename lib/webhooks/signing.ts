import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * HMAC signing for outbound webhook deliveries, and the matching
 * verification a receiving endpoint would run. One function computes the
 * signature (signPayload) -- both buildDeliveryHeaders (sender) and
 * verifySignature (a reference implementation for receivers, exercised for
 * real in lib/webhooks/__tests__ against a local HTTP server) call it, so
 * there is exactly one place the signing algorithm is defined.
 *
 * Scheme: HMAC-SHA256 over `${timestamp}.${body}`, the same
 * timestamp-bound construction Stripe/GitHub-style webhooks use --
 * binding the signature to a timestamp is what makes replay protection
 * possible (a receiver rejects a resent request once its timestamp falls
 * outside a tolerance window), not just payload tampering detection.
 */

export const DEFAULT_REPLAY_TOLERANCE_SECONDS = 5 * 60;

export function signPayload(secret: string, timestampSeconds: number, body: string): string {
  return createHmac('sha256', secret).update(`${timestampSeconds}.${body}`).digest('hex');
}

export interface DeliveryHeadersInput {
  secret: string;
  deliveryId: string;
  eventId: string;
  eventName: string;
  body: string;
  timestampSeconds?: number;
}

export function buildDeliveryHeaders(input: DeliveryHeadersInput): Record<string, string> {
  const timestamp = input.timestampSeconds ?? Math.floor(Date.now() / 1000);
  const signature = signPayload(input.secret, timestamp, input.body);
  return {
    'Content-Type': 'application/json',
    'X-Oxiom-Delivery-Id': input.deliveryId,
    'X-Oxiom-Event-Id': input.eventId,
    'X-Oxiom-Event': input.eventName,
    'X-Oxiom-Timestamp': String(timestamp),
    'X-Oxiom-Signature': `t=${timestamp},v1=${signature}`,
  };
}

export type SignatureVerificationResult = { ok: true } | { ok: false; reason: string };

/**
 * Reference implementation of what a webhook receiver should run.
 * Rejects a missing/malformed header, a signature that doesn't match
 * (constant-time compare -- never a plain string ==), and -- the replay
 * protection this milestone asks for -- a timestamp older than
 * toleranceSeconds, even when the signature itself is valid, so a captured
 * request can't be resent indefinitely.
 */
export function verifySignature(
  secret: string,
  body: string,
  signatureHeader: string | null | undefined,
  options: { toleranceSeconds?: number; nowSeconds?: number } = {}
): SignatureVerificationResult {
  if (!signatureHeader) {
    return { ok: false, reason: 'missing X-Oxiom-Signature header' };
  }
  const match = /^t=(\d+),v1=([0-9a-f]+)$/.exec(signatureHeader.trim());
  if (!match) {
    return { ok: false, reason: 'malformed X-Oxiom-Signature header' };
  }
  const timestamp = Number(match[1]);
  const providedSignature = match[2];

  const tolerance = options.toleranceSeconds ?? DEFAULT_REPLAY_TOLERANCE_SECONDS;
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    return { ok: false, reason: `timestamp outside the ${tolerance}s replay-protection tolerance window` };
  }

  const expectedSignature = signPayload(secret, timestamp, body);
  const expected = Buffer.from(expectedSignature, 'hex');
  const provided = Buffer.from(providedSignature, 'hex');
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return { ok: false, reason: 'signature does not match' };
  }

  return { ok: true };
}

/** A new random secret for registration/rotation -- 32 bytes, hex-encoded. */
export function generateWebhookSecret(): string {
  return randomBytes(32).toString('hex');
}
