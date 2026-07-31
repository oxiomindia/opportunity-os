import assert from 'node:assert/strict';
import test from 'node:test';
import { computeReadinessReport } from './readinessDashboard';

test('computeReadinessReport returns all five sections, each with at least one item', async () => {
  const report = await computeReadinessReport();
  for (const section of ['demoData', 'growth', 'seo', 'commercial', 'platform'] as const) {
    assert.ok(Array.isArray(report[section]) && report[section].length > 0, `${section} must be a non-empty array`);
  }
});

test('the Platform section reflects the real Engine Registry -- at least the four known engines, all reported healthy', async () => {
  const report = await computeReadinessReport();
  const engineFramework = report.platform.find((item) => item.label === 'Engine Framework');
  assert.ok(engineFramework);
  assert.equal(engineFramework?.ready, true);
  assert.match(engineFramework!.detail, /itc-recovery/);
  assert.match(engineFramework!.detail, /bills/);
  assert.match(engineFramework!.detail, /commercial/);
  assert.match(engineFramework!.detail, /growth-intelligence/);
});

test('the SEO section reflects real files on disk, not a hardcoded checklist', async () => {
  const report = await computeReadinessReport();
  const sitemap = report.seo.find((item) => item.label === 'Sitemap');
  assert.ok(sitemap);
  assert.equal(sitemap?.ready, true);
  assert.equal(sitemap?.detail, 'app/sitemap.ts');
});

test('the Demo Data section reports exactly 25 invoices', async () => {
  const report = await computeReadinessReport();
  const invoices = report.demoData.find((item) => item.label === 'Invoices');
  assert.ok(invoices);
  assert.equal(invoices?.ready, true);
  assert.match(invoices!.detail, /25/);
});
