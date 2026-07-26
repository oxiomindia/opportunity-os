import assert from 'node:assert/strict';
import test from 'node:test';
import { canUseDemoLogin, isDemoCredentials } from './demo-policy';
import { getAuthCapabilities } from '../supabase/config';
import { createLocalDemoToken, isLocalDemoEnabled, verifyLocalDemoToken } from './dev-session';

test('enables demo login only through an explicit development opt-in', () => {
  assert.equal(canUseDemoLogin({ NODE_ENV: 'development' }), false);
  assert.equal(canUseDemoLogin({ NODE_ENV: 'development', ENABLE_DEMO_LOGIN: 'true' }), true);
});

test('accepts demo credentials only while local demo mode is enabled', () => {
  assert.equal(isDemoCredentials({ NODE_ENV: 'development', ENABLE_DEMO_LOGIN: 'true' }, 'admin', 'admin'), true);
  assert.equal(isDemoCredentials({ NODE_ENV: 'production', ENABLE_DEMO_LOGIN: 'true' }, 'admin', 'admin'), false);
  assert.equal(isDemoCredentials({ NODE_ENV: 'development', ENABLE_DEMO_LOGIN: 'true' }, 'admin', 'wrong'), false);
});

test('does not allow an explicit opt-in outside development', () => {
  assert.equal(canUseDemoLogin({ NODE_ENV: 'test', ENABLE_DEMO_LOGIN: 'true' }), false);
});

test('keeps demo login disabled by default outside development', () => {
  assert.equal(canUseDemoLogin({ NODE_ENV: 'test' }), false);
});

test('cannot enable demo login in production, even with an override', () => {
  assert.equal(canUseDemoLogin({ NODE_ENV: 'production', ENABLE_DEMO_LOGIN: 'true' }), false);
});

test('advertises local demo login without Supabase only in opted-in development', () => {
  assert.deepEqual(getAuthCapabilities({ NODE_ENV: 'development' }), { supabase: false, localDemo: false, demo: false });
  assert.deepEqual(getAuthCapabilities({ NODE_ENV: 'development', ENABLE_DEMO_LOGIN: 'true' }), { supabase: false, localDemo: true, demo: true });
  assert.deepEqual(getAuthCapabilities({ NODE_ENV: 'production', ENABLE_DEMO_LOGIN: 'true', NEXT_PUBLIC_SUPABASE_URL: 'https://example.test', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon' }), { supabase: true, localDemo: false, demo: false });
});

test('creates a deterministic verifiable local demo session', async () => {
  assert.equal(isLocalDemoEnabled({ NODE_ENV: 'development', ENABLE_DEMO_LOGIN: 'true' }), true);
  const token = await createLocalDemoToken();
  assert.equal(await verifyLocalDemoToken(token), true);
  assert.equal(await verifyLocalDemoToken(`${token}tampered`), false);
});
