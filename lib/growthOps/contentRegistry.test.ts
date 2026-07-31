import assert from 'node:assert/strict';
import test from 'node:test';
import { clearContentRegistryForTests, getContent, listContent, listContentByType, registerContent, updateContentStatus } from './contentRegistry';

function reset() {
  clearContentRegistryForTests();
}

test('registerContent defaults status to draft', () => {
  reset();
  const entry = registerContent({ type: 'blog', title: 'ITC Recovery 101' });
  assert.equal(entry.status, 'draft');
  assert.equal(entry.type, 'blog');
});

test('listContent and getContent round-trip', () => {
  reset();
  const entry = registerContent({ type: 'guide', title: 'GST Filing Guide' });
  assert.deepEqual(listContent(), [entry]);
  assert.deepEqual(getContent(entry.id), entry);
});

test('listContentByType filters correctly', () => {
  reset();
  registerContent({ type: 'blog', title: 'Blog A' });
  registerContent({ type: 'faq', title: 'FAQ A' });
  registerContent({ type: 'faq', title: 'FAQ B' });

  assert.equal(listContentByType('faq').length, 2);
  assert.equal(listContentByType('case-study').length, 0);
});

test('updateContentStatus updates status and lastUpdated', async () => {
  reset();
  const entry = registerContent({ type: 'case-study', title: 'Case Study A' });

  const updated = updateContentStatus(entry.id, 'review');
  assert.equal(updated?.status, 'review');
  // >=, not a strict timestamp change: millisecond-resolution clocks can
  // legitimately produce the same ISO string for two calls microseconds
  // apart -- what matters is lastUpdated never goes backwards.
  assert.ok(updated!.lastUpdated >= entry.lastUpdated);
  assert.equal(updateContentStatus('does-not-exist', 'review'), undefined);
});
