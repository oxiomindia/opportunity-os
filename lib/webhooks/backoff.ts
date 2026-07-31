import type { RetryPolicy } from './types';

/**
 * The one function that computes a retry delay. lib/webhooks/delivery.ts
 * is the only caller -- keeping this here (rather than inline) is what
 * "avoid duplicate retry logic" means in practice: one formula, one place.
 *
 * attempt is 1-indexed (the attempt that just failed). Delay doubles each
 * attempt (attempt 1 -> initialDelayMs, attempt 2 -> 2x, attempt 3 -> 4x,
 * ...), capped at maxDelayMs. Full jitter (random within [0, delay]) is
 * applied on top so many endpoints failing at once don't all retry in
 * lockstep -- standard practice for exponential backoff at scale.
 */
export function computeBackoffDelayMs(attempt: number, policy: RetryPolicy, random: () => number = Math.random): number {
  const exponential = policy.initialDelayMs * 2 ** (attempt - 1);
  const capped = Math.min(exponential, policy.maxDelayMs);
  return Math.floor(random() * capped);
}

export function hasRetriesRemaining(attemptNumber: number, policy: RetryPolicy): boolean {
  return attemptNumber < policy.maxAttempts;
}
