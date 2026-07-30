import assert from 'node:assert/strict';
import test from 'node:test';
import { parseItcReturnCsv, buildItcReconciliationCsv } from './csv';
import type { ItcReconciliationReport } from './report';
import type { PurchaseRecord, ItcReturnRecord } from '../../types/itcRecovery';

// --- parseItcReturnCsv (import) ------------------------------------------------

test('parses a well-formed CSV with the documented headers', () => {
  const csv = 'Vendor GSTIN,Vendor Name,Return Invoice Number,Invoice Date,Return Period,Taxable Value,Tax Amount,Currency\n'
    + '27AAECM1234F1Z5,Acme Vendor,INV-1,2026-07-01,2026-07,1000,180,INR\n';
  const rows = parseItcReturnCsv(csv);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], {
    vendorGstin: '27AAECM1234F1Z5',
    vendorName: 'Acme Vendor',
    returnInvoiceNumber: 'INV-1',
    invoiceDate: '2026-07-01',
    returnPeriod: '2026-07',
    taxableValue: '1000',
    taxAmount: '180',
    currency: 'INR',
  });
});

test('handles quoted fields containing commas', () => {
  const csv = 'Vendor GSTIN,Vendor Name,Return Invoice Number,Return Period,Taxable Value,Tax Amount\n'
    + '27AAECM1234F1Z5,"Acme, Inc.",INV-1,2026-07,1000,180\n';
  const rows = parseItcReturnCsv(csv);
  assert.equal(rows[0].vendorName, 'Acme, Inc.');
});

test('header names are matched case-insensitively and by common alternates', () => {
  const csv = 'GSTIN,vendorname,Invoice Number,returnperiod,taxablevalue,TAX AMOUNT\n'
    + '27AAECM1234F1Z5,Acme,INV-1,2026-07,1000,180\n';
  const rows = parseItcReturnCsv(csv);
  assert.equal(rows[0].vendorGstin, '27AAECM1234F1Z5');
  assert.equal(rows[0].returnInvoiceNumber, 'INV-1');
});

test('a header-only file (no data rows) parses to an empty array', () => {
  assert.deepEqual(parseItcReturnCsv('Vendor GSTIN,Vendor Name\n'), []);
});

// --- buildItcReconciliationCsv (export) ------------------------------------------

function buildReport(rows: ItcReconciliationReport['rows'], overrides: Partial<ItcReconciliationReport> = {}): ItcReconciliationReport {
  return {
    organizationName: 'Test Org',
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
  vendorName: 'Acme, Inc.',
  vendorGstin: '27AAECM1234F1Z5',
  invoiceNumber: 'INV-1',
  invoiceDate: '2026-07-01',
  taxAmount: 1000,
  currency: 'INR',
};

const returnRec: ItcReturnRecord = {
  id: 'itc_1',
  vendorName: 'Acme, Inc.',
  vendorGstin: '27AAECM1234F1Z5',
  returnInvoiceNumber: 'INV-1',
  returnPeriod: '2026-07',
  taxableValue: 5000,
  taxAmount: 900,
  currency: 'INR',
  source: 'manual',
  createdAt: '2026-07-15T00:00:00Z',
};

test('CSV starts with a UTF-8 BOM', () => {
  const csv = buildItcReconciliationCsv(buildReport([]));
  assert.equal(csv.charCodeAt(0), 0xfeff);
});

test('CSV includes organization, period, and generated-at metadata', () => {
  const csv = buildItcReconciliationCsv(buildReport([]));
  assert.ok(csv.includes('Test Org'));
  assert.ok(csv.includes('2026-07'));
  assert.ok(csv.includes('Generated'));
});

test('CSV summary section transcribes the report summary exactly -- never recomputed', () => {
  const report = buildReport([], { summary: { totalPurchaseTax: 12345.678, totalReturnTax: 1, recoverableItc: 2, atRiskItc: 3, reconciliationPercentage: 44.4 } });
  const csv = buildItcReconciliationCsv(report);
  assert.ok(csv.includes('12345.68'), 'fixed to 2 decimals, not re-derived from detail rows');
  assert.ok(csv.includes('44.4%'));
});

test('CSV legend lists all four statuses', () => {
  const csv = buildItcReconciliationCsv(buildReport([]));
  for (const label of ['Matched', 'Mismatch', 'Missing in Return', 'Return Record Only']) {
    assert.ok(csv.includes(label), `missing legend entry for ${label}`);
  }
});

test('CSV detail row: numeric formatting is plain fixed-point, dates are YYYY-MM-DD', () => {
  const csv = buildItcReconciliationCsv(buildReport([{ status: 'matched', purchaseRecord: purchase, returnRecord: returnRec }]));
  const dataLine = csv.split('\r\n').find((line) => line.includes('INV-1') && line.includes('Matched'))!;
  assert.ok(dataLine, 'expected the detail row to be present');
  assert.ok(dataLine.includes('1000.00'));
  assert.ok(dataLine.includes('900.00'));
  assert.ok(dataLine.includes('2026-07-01'));
  assert.ok(!dataLine.includes('₹'), 'no currency symbol in a machine-readable numeric column');
});

test('CSV escapes a vendor name containing a comma', () => {
  const csv = buildItcReconciliationCsv(buildReport([{ status: 'matched', purchaseRecord: purchase, returnRecord: returnRec }]));
  assert.ok(csv.includes('"Acme, Inc."'));
});

test('mismatch rows include the tax difference column', () => {
  const mismatchReturn = { ...returnRec, taxAmount: 700 };
  const csv = buildItcReconciliationCsv(buildReport([{ status: 'mismatch', purchaseRecord: purchase, returnRecord: mismatchReturn, taxDifference: 300 }]));
  assert.ok(csv.includes('300.00'));
});

test('large dataset: 5,000 detail rows export correctly and quickly', () => {
  const rows: ItcReconciliationReport['rows'] = [];
  for (let i = 0; i < 5000; i += 1) {
    rows.push({
      status: 'matched',
      purchaseRecord: { ...purchase, vendorInvoiceId: `bill_${i}`, invoiceNumber: `INV-${i}` },
      returnRecord: { ...returnRec, id: `itc_${i}`, returnInvoiceNumber: `INV-${i}` },
    });
  }
  const start = performance.now();
  const csv = buildItcReconciliationCsv(buildReport(rows));
  const elapsedMs = performance.now() - start;

  const dataLines = csv.split('\r\n').filter((line) => line.includes('INV-'));
  assert.equal(dataLines.length, 5000);
  assert.ok(elapsedMs < 500, `expected under 500ms for 5,000 rows, took ${elapsedMs.toFixed(1)}ms`);
});
