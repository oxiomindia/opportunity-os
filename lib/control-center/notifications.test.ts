import assert from 'node:assert/strict';
import test from 'node:test';
import { computeLifecycleNotifications } from './notification-rules';

const NOW = new Date('2026-07-30T00:00:00Z');

function row(overrides: Partial<Parameters<typeof computeLifecycleNotifications>[0][number]>) {
  return {
    organization_id: 'org-1',
    trial_status: 'none',
    trial_ends_at: null,
    subscription_status: 'none',
    renewal_date: null,
    organizations: { name: 'Acme Co' },
    ...overrides,
  };
}

test('a trial ending within 3 days is a warning', () => {
  const notifications = computeLifecycleNotifications(
    [row({ trial_status: 'active', trial_ends_at: '2026-08-01T00:00:00Z' })],
    NOW,
  );
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].severity, 'warning');
  assert.equal(notifications[0].id, 'trial-org-1');
});

test('a trial that already ended is critical, not warning', () => {
  const notifications = computeLifecycleNotifications(
    [row({ trial_status: 'active', trial_ends_at: '2026-07-29T00:00:00Z' })],
    NOW,
  );
  assert.equal(notifications[0].severity, 'critical');
  assert.equal(notifications[0].title, 'Trial has ended');
});

test('a trial ending far in the future produces no notification', () => {
  const notifications = computeLifecycleNotifications(
    [row({ trial_status: 'active', trial_ends_at: '2026-09-01T00:00:00Z' })],
    NOW,
  );
  assert.equal(notifications.length, 0);
});

test('an expired (not active) trial is not flagged as ending', () => {
  const notifications = computeLifecycleNotifications(
    [row({ trial_status: 'expired', trial_ends_at: '2026-07-31T00:00:00Z' })],
    NOW,
  );
  assert.equal(notifications.length, 0);
});

test('a renewal due within 14 days is a warning', () => {
  const notifications = computeLifecycleNotifications(
    [row({ subscription_status: 'active', renewal_date: '2026-08-10' })],
    NOW,
  );
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].severity, 'warning');
  assert.equal(notifications[0].id, 'renewal-org-1');
});

test('a past_due subscription is always critical, regardless of renewal date', () => {
  const notifications = computeLifecycleNotifications(
    [row({ subscription_status: 'past_due' })],
    NOW,
  );
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].severity, 'critical');
  assert.equal(notifications[0].title, 'Subscription past due');
});

test('a healthy organization with no near-term events produces nothing', () => {
  const notifications = computeLifecycleNotifications(
    [row({ trial_status: 'none', subscription_status: 'active', renewal_date: '2027-01-01' })],
    NOW,
  );
  assert.equal(notifications.length, 0);
});

test('a single organization can produce multiple notifications at once', () => {
  const notifications = computeLifecycleNotifications(
    [row({ trial_status: 'active', trial_ends_at: '2026-07-31T00:00:00Z', subscription_status: 'past_due' })],
    NOW,
  );
  assert.equal(notifications.length, 2);
  assert.deepEqual(notifications.map((n) => n.id).sort(), ['past-due-org-1', 'trial-org-1']);
});

test('missing an organization name falls back rather than throwing', () => {
  const notifications = computeLifecycleNotifications(
    [row({ subscription_status: 'past_due', organizations: null })],
    NOW,
  );
  assert.equal(notifications[0].organizationName, 'Unknown organization');
});
