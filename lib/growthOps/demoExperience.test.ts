import assert from 'node:assert/strict';
import test from 'node:test';
import { runDemoExperienceChecks } from './demoExperience';

test('every demo experience area is checked, covering the milestone\'s required list', () => {
  const checks = runDemoExperienceChecks();
  const areas = checks.map((check) => check.area);
  assert.deepEqual(areas, ['Dashboard', 'Customers', 'Vendors', 'Products', 'Invoices', 'Bills', 'Reports', 'GST', 'Search', 'Filters']);
});

test('every check passes against the actual demo dataset shipped with this milestone', () => {
  const checks = runDemoExperienceChecks();
  const failures = checks.filter((check) => check.status === 'fail');
  assert.deepEqual(failures, [], `expected no failing checks, got: ${JSON.stringify(failures)}`);
});

test('the GST check exercises the real reconciliation logic and reports a non-trivial result', () => {
  const gstCheck = runDemoExperienceChecks().find((check) => check.area === 'GST');
  assert.ok(gstCheck);
  assert.equal(gstCheck?.status, 'pass');
  assert.match(gstCheck!.detail, /distinct statuses/);
});
