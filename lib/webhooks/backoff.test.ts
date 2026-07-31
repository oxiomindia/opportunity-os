import assert from 'node:assert/strict';
import test from 'node:test';
import { computeBackoffDelayMs, hasRetriesRemaining } from './backoff';
import { DEFAULT_RETRY_POLICY } from './types';
import type { RetryPolicy } from './types';

const noJitter = () => 1; // random() -> 1 makes the delay exactly the capped exponential value

test('delay doubles per attempt before hitting the cap, with random()=1 removing jitter', () => {
  const policy: RetryPolicy = { maxAttempts: 10, initialDelayMs: 1000, maxDelayMs: 60_000 };
  assert.equal(computeBackoffDelayMs(1, policy, noJitter), 1000);
  assert.equal(computeBackoffDelayMs(2, policy, noJitter), 2000);
  assert.equal(computeBackoffDelayMs(3, policy, noJitter), 4000);
  assert.equal(computeBackoffDelayMs(4, policy, noJitter), 8000);
});

test('delay is capped at maxDelayMs regardless of how large the exponential would be', () => {
  const policy: RetryPolicy = { maxAttempts: 20, initialDelayMs: 1000, maxDelayMs: 5000 };
  assert.equal(computeBackoffDelayMs(10, policy, noJitter), 5000);
});

test('jitter keeps the delay within [0, cappedExponential]', () => {
  const policy: RetryPolicy = { maxAttempts: 10, initialDelayMs: 1000, maxDelayMs: 60_000 };
  for (const random of [0, 0.25, 0.5, 0.75, 0.999]) {
    const delay = computeBackoffDelayMs(3, policy, () => random);
    assert.ok(delay >= 0 && delay <= 4000, `delay ${delay} out of [0, 4000] for random()=${random}`);
  }
});

test('hasRetriesRemaining is true while attemptNumber is below maxAttempts, false once it reaches it', () => {
  const policy: RetryPolicy = { ...DEFAULT_RETRY_POLICY, maxAttempts: 3 };
  assert.equal(hasRetriesRemaining(1, policy), true);
  assert.equal(hasRetriesRemaining(2, policy), true);
  assert.equal(hasRetriesRemaining(3, policy), false);
  assert.equal(hasRetriesRemaining(4, policy), false);
});
