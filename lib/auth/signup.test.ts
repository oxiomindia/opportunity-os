import assert from 'node:assert/strict';
import test from 'node:test';
import { signupSchema } from './signup';

const valid = { fullName: 'Ada Lovelace', email: 'ada@example.com', phone: '+14155552671', organizationName: 'Analytical Engines', password: 'Correct-Horse-42!', confirmPassword: 'Correct-Horse-42!', acceptTerms: 'on', acceptPrivacy: 'on' };
test('accepts a complete production signup', () => assert.equal(signupSchema.safeParse(valid).success, true));
test('rejects invalid email, phone, weak and mismatched passwords', () => {
  assert.equal(signupSchema.safeParse({ ...valid, email: 'bad' }).success, false);
  assert.equal(signupSchema.safeParse({ ...valid, phone: '4155552671' }).success, false);
  assert.equal(signupSchema.safeParse({ ...valid, password: 'weak', confirmPassword: 'weak' }).success, false);
  assert.equal(signupSchema.safeParse({ ...valid, confirmPassword: 'Different-42!' }).success, false);
});
test('requires both policy acceptances', () => {
  assert.equal(signupSchema.safeParse({ ...valid, acceptTerms: undefined }).success, false);
  assert.equal(signupSchema.safeParse({ ...valid, acceptPrivacy: undefined }).success, false);
});
