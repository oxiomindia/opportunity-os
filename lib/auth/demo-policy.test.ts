import assert from 'node:assert/strict';
import test from 'node:test';
import { canUseDemoLogin } from './demo-policy';

test('enables demo login during development', () => {
  assert.equal(canUseDemoLogin({ NODE_ENV: 'development' }), true);
});

test('allows an explicit opt-in outside production', () => {
  assert.equal(canUseDemoLogin({ NODE_ENV: 'test', ENABLE_DEMO_LOGIN: 'true' }), true);
});

test('keeps demo login disabled by default outside development', () => {
  assert.equal(canUseDemoLogin({ NODE_ENV: 'test' }), false);
});

test('cannot enable demo login in production, even with an override', () => {
  assert.equal(canUseDemoLogin({ NODE_ENV: 'production', ENABLE_DEMO_LOGIN: 'true' }), false);
});
