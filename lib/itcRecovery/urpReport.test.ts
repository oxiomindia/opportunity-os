import assert from 'node:assert/strict';
import test from 'node:test';
import './urpReport';
import { itcReconciliationUrpReport } from './urpReport';
import { getRegisteredReport } from '../urp/registry';
import { buildItcReconciliationCsv } from './csv';
import type { ItcReconciliationReport } from './report';
import type { PurchaseRecord, ItcReturnRecord } from '../../types/itcRecovery';

/**
 * Builds a fixture ItcReconciliationReport directly, the same way
 * csv.test.ts does -- getItcReconciliationReport() itself depends on
 * requireSessionContext() (real auth/session), so unit tests exercise the
 * pure rendering/validation functions against fixture data rather than the
 * full pipeline's data-fetch step.
 */
function buildReport(rows: ItcReconciliationReport['rows'], overrides: Partial<ItcReconciliationReport> = {}): ItcReconciliationReport {
  return {
    organizationName: 'Acme & Co.',
    period: '2026-07',
    periods: ['2026-07'],
    rows,
    summary: {
      totalPurchaseTax: 1000,
      totalReturnTax: 900,
      recoverableItc: 900,
      atRiskItc: 100,
      reconciliationPercentage: 90,
    },
    generatedAt: '2026-07-30T10:15:00Z',
    ...overrides,
  };
}

const purchase: PurchaseRecord = {
  vendorInvoiceId: 'bill_1',
  vendorName: '<Acme> & "Sons"',
  vendorGstin: '27AAECM1234F1Z5',
  invoiceNumber: 'INV-1',
  invoiceDate: '2026-07-01',
  taxAmount: 1000,
  currency: 'INR',
};

const returnRec: ItcReturnRecord = {
  id: 'itc_1',
  vendorName: '<Acme> & "Sons"',
  vendorGstin: '27AAECM1234F1Z5',
  returnInvoiceNumber: 'INV-1',
  returnPeriod: '2026-07',
  taxableValue: 5000,
  taxAmount: 900,
  currency: 'INR',
  source: 'manual',
  createdAt: '2026-07-15T00:00:00Z',
};

test('registers as "itc-reconciliation" with all five output formats and correct metadata', () => {
  const registered = getRegisteredReport('itc-reconciliation');
  assert.ok(registered);
  assert.equal(registered?.metadata.sourceEngine, 'itc-recovery');
  assert.equal(registered?.metadata.category, 'tax');
  assert.equal(registered?.status, 'active');
  assert.deepEqual(registered?.supportedFormats.sort(), ['csv', 'html', 'json', 'markdown', 'pdf']);
});

test('validateInput accepts a well-formed period, rejects a malformed one, and defaults a missing input', () => {
  assert.deepEqual(itcReconciliationUrpReport.validateInput({ period: '2026-07' }), { ok: true, data: { period: '2026-07' } });
  assert.equal(itcReconciliationUrpReport.validateInput({ period: 'not-a-period' }).ok, false);
  assert.deepEqual(itcReconciliationUrpReport.validateInput(undefined as never), { ok: true, data: {} });
});

test('the json template round-trips the exact report object', async () => {
  const report = buildReport([{ status: 'matched', purchaseRecord: purchase, returnRecord: returnRec }]);
  const rendered = await itcReconciliationUrpReport.templates.json!.render(report);
  assert.equal(rendered.contentType, 'application/json');
  assert.deepEqual(JSON.parse(rendered.content as string), report);
});

test('the csv template reuses buildItcReconciliationCsv exactly -- no duplicate rendering logic', async () => {
  const report = buildReport([{ status: 'matched', purchaseRecord: purchase, returnRecord: returnRec }]);
  const rendered = await itcReconciliationUrpReport.templates.csv!.render(report);
  assert.equal(rendered.content, buildItcReconciliationCsv(report));
  assert.equal(rendered.contentType, 'text/csv; charset=utf-8');
});

test('the markdown template includes organization, period, summary figures, and one row per record', async () => {
  const report = buildReport([{ status: 'matched', purchaseRecord: purchase, returnRecord: returnRec }]);
  const rendered = await itcReconciliationUrpReport.templates.markdown!.render(report);
  const content = rendered.content as string;
  assert.ok(content.startsWith('# Input Tax Credit Reconciliation Report'));
  assert.ok(content.includes('Acme & Co.'));
  assert.ok(content.includes('2026-07'));
  assert.ok(content.includes('INV-1'));
  assert.equal(rendered.contentType, 'text/markdown; charset=utf-8');
});

test('the html template escapes vendor names containing HTML-significant characters', async () => {
  const report = buildReport([{ status: 'matched', purchaseRecord: purchase, returnRecord: returnRec }]);
  const rendered = await itcReconciliationUrpReport.templates.html!.render(report);
  const content = rendered.content as string;
  assert.ok(content.includes('&lt;Acme&gt; &amp; &quot;Sons&quot;'));
  assert.ok(!content.includes('<Acme>'), 'raw, unescaped vendor name must not appear in the HTML output');
  assert.equal(rendered.contentType, 'text/html; charset=utf-8');
});

test('the pdf template reuses renderItcReconciliationPdfBuffer and produces a non-empty PDF buffer', async () => {
  const report = buildReport([{ status: 'matched', purchaseRecord: purchase, returnRecord: returnRec }]);
  const rendered = await itcReconciliationUrpReport.templates.pdf!.render(report);
  assert.equal(rendered.contentType, 'application/pdf');
  assert.ok(Buffer.isBuffer(rendered.content));
  assert.ok((rendered.content as Buffer).length > 0);
});

test('filenames are period-scoped and format-suffixed, falling back to "all-periods" when no period is set', async () => {
  const withPeriod = buildReport([]);
  const withoutPeriod = buildReport([], { period: null });

  assert.equal((await itcReconciliationUrpReport.templates.json!.render(withPeriod)).filename, 'itc-recovery-reconciliation-2026-07.json');
  assert.equal((await itcReconciliationUrpReport.templates.json!.render(withoutPeriod)).filename, 'itc-recovery-reconciliation-all-periods.json');
});
