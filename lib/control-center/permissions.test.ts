import assert from 'node:assert/strict';
import test from 'node:test';
import { permissions, type ControlCenterPermission } from './permissions';

const allPermissions = Object.keys(permissions) as ControlCenterPermission[];

test('platform-admin (Owner) has every permission', () => {
  for (const key of allPermissions) {
    assert.equal(permissions[key]({ role: 'platform-admin' }), true, `expected ${key} to be true for platform-admin`);
  }
});

test('product-admin can only access Feedback, per the Admin Platform Consolidation', () => {
  for (const key of allPermissions) {
    const expected = key === 'canAccessFeedback';
    assert.equal(permissions[key]({ role: 'product-admin' }), expected, `expected ${key} to be ${expected} for product-admin`);
  }
});

test('security-admin can only access Feedback, per the Admin Platform Consolidation', () => {
  for (const key of allPermissions) {
    const expected = key === 'canAccessFeedback';
    assert.equal(permissions[key]({ role: 'security-admin' }), expected, `expected ${key} to be ${expected} for security-admin`);
  }
});

test('a null subject (unauthenticated) has no permissions', () => {
  for (const key of allPermissions) {
    assert.equal(permissions[key](null), false, `expected ${key} to be false for null`);
  }
});
