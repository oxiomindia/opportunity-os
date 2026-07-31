import assert from 'node:assert/strict';
import test from 'node:test';
import { controlCenterModules, getVisibleModules } from './navigation';

test('platform-admin sees every module (all currently require Owner-level permissions)', () => {
  const visible = getVisibleModules('platform-admin').map((module) => module.id);
  assert.deepEqual(visible.sort(), controlCenterModules.map((module) => module.id).sort());
});

test('a non-Owner platform admin role sees only Feedback, per the Admin Platform Consolidation', () => {
  assert.deepEqual(getVisibleModules('product-admin').map((module) => module.id), ['feedback']);
  assert.deepEqual(getVisibleModules('security-admin').map((module) => module.id), ['feedback']);
});

test('every module has a unique id and a route that starts with /control-center', () => {
  const ids = controlCenterModules.map((module) => module.id);
  assert.equal(new Set(ids).size, ids.length, 'module ids must be unique');
  for (const entry of controlCenterModules) {
    assert.ok(entry.route.startsWith('/control-center'), `${entry.id} route "${entry.route}" should start with /control-center`);
  }
});

test('every shipped module (including Feedback, Engine Registry, Event Monitor, URP, Webhook Engine, and now Growth Intelligence) is available; the remaining platform-capability placeholders stay planned', () => {
  const available = controlCenterModules.filter((module) => module.availability === 'available').map((module) => module.id).sort();
  assert.deepEqual(available, [
    'audit-logs',
    'coupons',
    'customers',
    'dashboard',
    'engine-registry',
    'event-monitor',
    'feedback',
    'growth-intelligence',
    'pricing',
    'products',
    'promotions',
    'revenue',
    'settings',
    'subscriptions',
    'trials',
    'urp',
    'webhook-engine',
  ]);

  const planned = controlCenterModules.filter((module) => module.availability === 'planned').map((module) => module.id).sort();
  assert.deepEqual(planned, ['audit-diagnostics', 'integrations', 'platform-configuration', 'system-health']);
});
