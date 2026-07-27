import assert from 'node:assert/strict';
import test from 'node:test';
import { signupErrorMessage, signupExceptionMessage } from './signup-error';

test('surfaces an actionable Supabase signup error and its diagnostic code', () => {
  assert.equal(
    signupErrorMessage({ code: 'unexpected_failure', message: 'Database error saving new user', status: 500 }),
    'The authentication service could not create the account: Database error saving new user (error: unexpected_failure)',
  );
});

test('translates known authentication errors without exposing implementation details', () => {
  assert.equal(
    signupErrorMessage({ code: 'over_email_send_rate_limit', message: 'email rate limit exceeded', status: 429 }),
    'Too many verification emails were requested. Wait a few minutes and try again.',
  );
});

test('reports thrown authentication client failures', () => {
  assert.equal(signupExceptionMessage(new Error('fetch failed')), 'fetch failed');
  assert.equal(signupExceptionMessage(null), 'Unknown server error');
});
