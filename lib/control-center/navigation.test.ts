import assert from 'node:assert/strict';
import test from 'node:test';
import { controlCenterModules, getVisibleModules } from './navigation';

test('platform-admin sees every module (all currently require Owner-level permissions)', () => {
  const visible = getVisibleModules('platform-admin').map((module) => module.id);
  assert.deepEqual(visible.sort(), controlCenterModules.map((module) => module.id).sort());
});

test('a non-Owner role sees no modules at all today', () => {
  assert.equal(getVisibleModules('product-admin').length, 0);
  assert.equal(getVisibleModules('security-admin').length, 0);
});

test('every module has a unique id and a route that starts with /control-center', () => {
  const ids = controlCenterModules.map((module) => module.id);
  assert.equal(new Set(ids).size, ids.length, 'module ids must be unique');
  for (const entry of controlCenterModules) {
    assert.ok(entry.route.startsWith('/control-center'), `${entry.id} route "${entry.route}" should start with /control-center`);
  }
});

test('exactly the Phase 2a, Trials, and Subscriptions modules are available; the rest are planned', () => {
  const available = controlCenterModules.filter((module) => module.availability === 'available').map((module) => module.id).sort();
  assert.deepEqual(available, ['audit-logs', 'customers', 'dashboard', 'pricing', 'products', 'subscriptions', 'trials']);
});
