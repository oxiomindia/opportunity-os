import assert from 'node:assert/strict';
import test from 'node:test';
import { clearRegistryForTests, getEndpoint, getEndpointForDelivery, listEndpoints, registerEndpoint, rotateSecret, updateEndpointStatus } from './registry';
import { DEFAULT_RETRY_POLICY } from './types';

test('registerEndpoint returns a summary without the secret, and defaults status/version/retryPolicy', () => {
  clearRegistryForTests();
  const endpoint = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['*'] });

  assert.equal(endpoint.url, 'https://example.com/hook');
  assert.equal(endpoint.status, 'active');
  assert.equal(endpoint.version, 1);
  assert.deepEqual(endpoint.retryPolicy, DEFAULT_RETRY_POLICY);
  assert.equal(endpoint.secretStatus.version, 1);
  assert.ok(endpoint.createdAt);
  assert.ok(endpoint.updatedAt);
  assert.equal((endpoint as unknown as { secret?: string }).secret, undefined, 'summary must never include the secret');
});

test('listEndpoints and getEndpoint round-trip a registered endpoint', () => {
  clearRegistryForTests();
  const registered = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['report.generated'] });

  assert.deepEqual(listEndpoints(), [registered]);
  assert.deepEqual(getEndpoint(registered.id), registered);
  assert.equal(getEndpoint('does-not-exist'), undefined);
});

test('getEndpointForDelivery exposes the real secret for internal use by delivery, unlike getEndpoint', () => {
  clearRegistryForTests();
  const registered = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['*'], secret: 'a-fixed-secret' });
  const withSecret = getEndpointForDelivery(registered.id);
  assert.equal(withSecret?.secret, 'a-fixed-secret');
});

test('updateEndpointStatus flips status and bumps updatedAt', async () => {
  clearRegistryForTests();
  const registered = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['*'] });
  await new Promise((resolve) => setTimeout(resolve, 2));

  const updated = updateEndpointStatus(registered.id, 'paused');
  assert.equal(updated?.status, 'paused');
  assert.notEqual(updated?.updatedAt, registered.updatedAt);
  assert.equal(updateEndpointStatus('does-not-exist', 'paused'), undefined);
});

test('rotateSecret issues a new secret, bumps secretStatus.version, and the old secret stops working', () => {
  clearRegistryForTests();
  const registered = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['*'], secret: 'original-secret' });

  const rotated = rotateSecret(registered.id);
  assert.equal(rotated?.secretStatus.version, 2);

  const withSecret = getEndpointForDelivery(registered.id);
  assert.notEqual(withSecret?.secret, 'original-secret');
  assert.equal(rotateSecret('does-not-exist'), undefined);
});

test('each registered endpoint gets a unique id', () => {
  clearRegistryForTests();
  const a = registerEndpoint({ url: 'https://example.com/a', eventFilters: ['*'] });
  const b = registerEndpoint({ url: 'https://example.com/b', eventFilters: ['*'] });
  assert.notEqual(a.id, b.id);
});
