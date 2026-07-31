import assert from 'node:assert/strict';
import test from 'node:test';
import { clearRegistryForTests, registerEndpoint, updateEndpointStatus } from './registry';
import { findSubscribedEndpoints, matchesFilters } from './subscriptions';

test('matchesFilters matches an exact event name', () => {
  assert.equal(matchesFilters(['report.generated'], 'report.generated'), true);
  assert.equal(matchesFilters(['report.generated'], 'report.failed'), false);
});

test('matchesFilters treats "*" as matching every event', () => {
  assert.equal(matchesFilters(['*'], 'anything.at.all'), true);
});

test('findSubscribedEndpoints returns only endpoints whose filters match the event name', () => {
  clearRegistryForTests();
  const reportsOnly = registerEndpoint({ url: 'https://example.com/reports', eventFilters: ['report.generated', 'report.failed'] });
  registerEndpoint({ url: 'https://example.com/health', eventFilters: ['engine.health-checked'] });

  const matches = findSubscribedEndpoints({ eventName: 'report.generated' });
  assert.deepEqual(matches.map((endpoint) => endpoint.id), [reportsOnly.id]);
});

test('findSubscribedEndpoints excludes paused and disabled endpoints even when their filters match', () => {
  clearRegistryForTests();
  const endpoint = registerEndpoint({ url: 'https://example.com/hook', eventFilters: ['*'] });

  assert.deepEqual(
    findSubscribedEndpoints({ eventName: 'anything' }).map((e) => e.id),
    [endpoint.id]
  );

  updateEndpointStatus(endpoint.id, 'paused');
  assert.deepEqual(findSubscribedEndpoints({ eventName: 'anything' }), []);

  updateEndpointStatus(endpoint.id, 'disabled');
  assert.deepEqual(findSubscribedEndpoints({ eventName: 'anything' }), []);
});
