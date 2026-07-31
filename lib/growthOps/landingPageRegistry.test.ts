import assert from 'node:assert/strict';
import test from 'node:test';
import { clearLandingPageRegistryForTests, getLandingPage, listLandingPages, registerLandingPage, updateLandingPageStatus } from './landingPageRegistry';

function reset() {
  clearLandingPageRegistryForTests();
}

test('registerLandingPage defaults publishStatus to draft and canonical to the url', () => {
  reset();
  const page = registerLandingPage({ url: '/solutions/gst-software', industry: 'Manufacturing', targetKeyword: 'gst software', metaTitle: 'GST Software', metaDescription: 'x' });
  assert.equal(page.publishStatus, 'draft');
  assert.equal(page.canonical, '/solutions/gst-software');
  assert.ok(page.lastUpdated);
});

test('listLandingPages and getLandingPage round-trip', () => {
  reset();
  const page = registerLandingPage({ url: '/x', industry: 'Retail', targetKeyword: 'kw', metaTitle: 't', metaDescription: 'd' });
  assert.deepEqual(listLandingPages(), [page]);
  assert.deepEqual(getLandingPage(page.id), page);
  assert.equal(getLandingPage('does-not-exist'), undefined);
});

test('updateLandingPageStatus updates status and lastUpdated', async () => {
  reset();
  const page = registerLandingPage({ url: '/x', industry: 'Retail', targetKeyword: 'kw', metaTitle: 't', metaDescription: 'd' });

  const updated = updateLandingPageStatus(page.id, 'published');
  assert.equal(updated?.publishStatus, 'published');
  // >=, not a strict timestamp change: millisecond-resolution clocks can
  // legitimately produce the same ISO string for two calls microseconds
  // apart -- what matters is lastUpdated never goes backwards.
  assert.ok(updated!.lastUpdated >= page.lastUpdated);
  assert.equal(updateLandingPageStatus('does-not-exist', 'published'), undefined);
});
