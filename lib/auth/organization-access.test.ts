import assert from 'node:assert/strict';
import test from 'node:test';
import { requiresOrganization } from './organization-access';

test('keeps the dashboard and organization setup available without a membership', () => {
  assert.equal(requiresOrganization('/dashboard'), false);
  assert.equal(requiresOrganization('/onboarding'), false);
  assert.equal(requiresOrganization('/organization-required'), false);
});

test('protects organization-dependent workspace routes', () => {
  for (const pathname of ['/invoices', '/invoices/new', '/customers', '/products', '/reports', '/settings', '/feedback']) {
    assert.equal(requiresOrganization(pathname), true, pathname);
  }
});

test('does not protect similarly named or informational routes', () => {
  assert.equal(requiresOrganization('/reports-public'), false);
  assert.equal(requiresOrganization('/about'), false);
});
