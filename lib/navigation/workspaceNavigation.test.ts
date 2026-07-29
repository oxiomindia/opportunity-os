import assert from 'node:assert/strict';
import test from 'node:test';
import { getNavigationItemsForEdition } from '../../app/components/workspaceNavigation';

test('AP edition hides AR-only items and shows AP-only and shared items', () => {
  const hrefs = getNavigationItemsForEdition('ap').map((item) => item.href);
  assert.ok(hrefs.includes('/vendors'));
  assert.ok(hrefs.includes('/bills'));
  assert.ok(hrefs.includes('/dashboard'));
  assert.ok(!hrefs.includes('/customers'));
  assert.ok(!hrefs.includes('/invoices'));
});

test('AR edition hides AP-only items and shows AR-only and shared items', () => {
  const hrefs = getNavigationItemsForEdition('ar').map((item) => item.href);
  assert.ok(hrefs.includes('/customers'));
  assert.ok(hrefs.includes('/invoices'));
  assert.ok(!hrefs.includes('/vendors'));
  assert.ok(!hrefs.includes('/bills'));
});

test('finance_suite edition shows everything', () => {
  const hrefs = getNavigationItemsForEdition('finance_suite').map((item) => item.href);
  assert.ok(hrefs.includes('/customers'));
  assert.ok(hrefs.includes('/vendors'));
  assert.ok(hrefs.includes('/invoices'));
  assert.ok(hrefs.includes('/bills'));
});
