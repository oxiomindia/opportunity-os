import assert from 'node:assert/strict';
import test from 'node:test';
import { reconcileItcRecords, summarizeReconciliation } from './reconciliation';
import type { ItcReturnRecord, PurchaseRecord } from '../../types/itcRecovery';

let purchaseSeq = 0;
function purchase(overrides: Partial<PurchaseRecord> = {}): PurchaseRecord {
  purchaseSeq += 1;
  return {
    vendorInvoiceId: `bill_${purchaseSeq}`,
    vendorName: 'Acme Vendor',
    vendorGstin: '27AAECM1234F1Z5',
    invoiceNumber: 'INV-1',
    invoiceDate: '2026-07-01',
    taxAmount: 1000,
    currency: 'INR',
    ...overrides,
  };
}

let returnSeq = 0;
function returnRecord(overrides: Partial<ItcReturnRecord> = {}): ItcReturnRecord {
  returnSeq += 1;
  return {
    id: `itc_${returnSeq}`,
    vendorName: 'Acme Vendor',
    vendorGstin: '27AAECM1234F1Z5',
    returnInvoiceNumber: 'INV-1',
    returnPeriod: '2026-07',
    taxableValue: 5000,
    taxAmount: 1000,
    currency: 'INR',
    source: 'manual',
    createdAt: '2026-07-15T00:00:00Z',
    ...overrides,
  };
}

// --- Classification accuracy ---------------------------------------------

test('perfect match: identical GSTIN, invoice number, and amount', () => {
  const p = purchase({ taxAmount: 1000 });
  const r = returnRecord({ taxAmount: 1000 });
  const rows = reconcileItcRecords([p], [r]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'matched');
  assert.equal(rows[0].purchaseRecord, p);
  assert.equal(rows[0].returnRecord, r);
});

test('amount mismatch: same key, amounts differ beyond tolerance', () => {
  const p = purchase({ taxAmount: 1000 });
  const r = returnRecord({ taxAmount: 800 });
  const rows = reconcileItcRecords([p], [r]);
  assert.equal(rows[0].status, 'mismatch');
  assert.equal(rows[0].taxDifference, 200);
});

test('missing in return: purchase invoice with no matching return record', () => {
  const p = purchase({ invoiceNumber: 'INV-NO-RETURN' });
  const rows = reconcileItcRecords([p], []);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'missing-in-return');
  assert.equal(rows[0].purchaseRecord, p);
  assert.equal(rows[0].returnRecord, undefined);
});

test('return record only: filed return with no matching purchase invoice', () => {
  const r = returnRecord({ returnInvoiceNumber: 'INV-NO-PURCHASE' });
  const rows = reconcileItcRecords([], [r]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'return-record-only');
  assert.equal(rows[0].returnRecord, r);
  assert.equal(rows[0].purchaseRecord, undefined);
});

// --- Duplicate handling ----------------------------------------------------

test('duplicate invoice numbers on the purchase side: only the first claims the return record', () => {
  const p1 = purchase({ vendorInvoiceId: 'bill_first' });
  const p2 = purchase({ vendorInvoiceId: 'bill_second' });
  const r = returnRecord();
  const rows = reconcileItcRecords([p1, p2], [r]);
  assert.equal(rows.length, 2);
  const first = rows.find((row) => row.purchaseRecord?.vendorInvoiceId === 'bill_first')!;
  const second = rows.find((row) => row.purchaseRecord?.vendorInvoiceId === 'bill_second')!;
  assert.equal(first.status, 'matched');
  assert.equal(second.status, 'missing-in-return', 'a second purchase invoice cannot also claim the same filed credit');
});

test('duplicate return records under the same key: only one is consumed, the rest surface as return-record-only', () => {
  const p = purchase();
  const r1 = returnRecord({ id: 'itc_first' });
  const r2 = returnRecord({ id: 'itc_second' });
  const rows = reconcileItcRecords([p], [r1, r2]);
  assert.equal(rows.length, 2);
  const matchedRow = rows.find((row) => row.status === 'matched')!;
  const leftoverRow = rows.find((row) => row.status === 'return-record-only')!;
  assert.equal(matchedRow.returnRecord?.id, 'itc_first', 'first return record in input order is consumed');
  assert.equal(leftoverRow.returnRecord?.id, 'itc_second');
});

test('duplicate handling never double-counts recoverable ITC in the summary', () => {
  const p1 = purchase({ vendorInvoiceId: 'bill_a' });
  const p2 = purchase({ vendorInvoiceId: 'bill_b' });
  const r = returnRecord();
  const summary = summarizeReconciliation(reconcileItcRecords([p1, p2], [r]));
  // Only bill_a's 1000 is recoverable; bill_b is missing-in-return (at risk), not double-counted as also recoverable.
  assert.equal(summary.recoverableItc, 1000);
  assert.equal(summary.atRiskItc, 1000);
});

// --- Normalization ----------------------------------------------------------

test('invoice number case differences are matched', () => {
  const p = purchase({ invoiceNumber: 'inv-100' });
  const r = returnRecord({ returnInvoiceNumber: 'INV-100' });
  assert.equal(reconcileItcRecords([p], [r])[0].status, 'matched');
});

test('GSTIN case differences are matched', () => {
  const p = purchase({ vendorGstin: '27aaecm1234f1z5' });
  const r = returnRecord({ vendorGstin: '27AAECM1234F1Z5' });
  assert.equal(reconcileItcRecords([p], [r])[0].status, 'matched');
});

test('whitespace around GSTIN/invoice number is normalized before matching', () => {
  const p = purchase({ vendorGstin: '  27AAECM1234F1Z5  ', invoiceNumber: ' INV-1 ' });
  const r = returnRecord({ vendorGstin: '27AAECM1234F1Z5', returnInvoiceNumber: 'INV-1' });
  assert.equal(reconcileItcRecords([p], [r])[0].status, 'matched');
});

// --- Amount tolerance --------------------------------------------------------

test('amount tolerance boundary: exactly at the tolerance is still matched', () => {
  const p = purchase({ taxAmount: 1000 });
  const r = returnRecord({ taxAmount: 999 }); // diff = 1, default tolerance = 1
  assert.equal(reconcileItcRecords([p], [r])[0].status, 'matched');
});

test('amount tolerance boundary: just beyond the tolerance is a mismatch', () => {
  const p = purchase({ taxAmount: 1000 });
  const r = returnRecord({ taxAmount: 998.99 }); // diff = 1.01
  assert.equal(reconcileItcRecords([p], [r])[0].status, 'mismatch');
});

test('a custom tolerance is honored', () => {
  const p = purchase({ taxAmount: 1000 });
  const r = returnRecord({ taxAmount: 950 });
  assert.equal(reconcileItcRecords([p], [r], 50)[0].status, 'matched');
  assert.equal(reconcileItcRecords([p], [r], 49)[0].status, 'mismatch');
});

test('zero tax amount on both sides is a match, not a special case', () => {
  const p = purchase({ taxAmount: 0 });
  const r = returnRecord({ taxAmount: 0 });
  assert.equal(reconcileItcRecords([p], [r])[0].status, 'matched');
});

// --- Empty / large datasets --------------------------------------------------

test('empty datasets produce no rows and an all-zero summary', () => {
  const rows = reconcileItcRecords([], []);
  assert.deepEqual(rows, []);
  assert.deepEqual(summarizeReconciliation(rows), {
    totalPurchaseTax: 0,
    totalReturnTax: 0,
    recoverableItc: 0,
    atRiskItc: 0,
    reconciliationPercentage: 0,
  });
});

test('large datasets: 5,000 purchase + 5,000 return records reconcile correctly and quickly', () => {
  const purchases: PurchaseRecord[] = [];
  const returns: ItcReturnRecord[] = [];
  for (let i = 0; i < 5000; i += 1) {
    purchases.push(purchase({ vendorInvoiceId: `bill_${i}`, invoiceNumber: `INV-${i}`, taxAmount: 100 }));
    // Every third return record is deliberately mismatched, every fifth omitted, to produce a realistic mix.
    if (i % 5 !== 0) {
      returns.push(returnRecord({ id: `itc_${i}`, returnInvoiceNumber: `INV-${i}`, taxAmount: i % 3 === 0 ? 90 : 100 }));
    }
  }

  const start = performance.now();
  const rows = reconcileItcRecords(purchases, returns);
  const elapsedMs = performance.now() - start;

  assert.equal(rows.length, 5000);
  assert.equal(rows.filter((row) => row.status === 'missing-in-return').length, 1000); // every 5th
  assert.ok(elapsedMs < 200, `expected under 200ms for 5,000 records, took ${elapsedMs.toFixed(1)}ms`);
});

// --- Multiple return periods --------------------------------------------------

test('multiple return periods reconcile independently by key, regardless of period', () => {
  const p1 = purchase({ vendorInvoiceId: 'bill_may', invoiceNumber: 'INV-MAY' });
  const p2 = purchase({ vendorInvoiceId: 'bill_jun', invoiceNumber: 'INV-JUN' });
  const rMay = returnRecord({ returnInvoiceNumber: 'INV-MAY', returnPeriod: '2026-05' });
  const rJun = returnRecord({ returnInvoiceNumber: 'INV-JUN', returnPeriod: '2026-06' });
  const rows = reconcileItcRecords([p1, p2], [rMay, rJun]);
  assert.equal(rows.length, 2);
  assert.ok(rows.every((row) => row.status === 'matched'));
});

// --- Currency ------------------------------------------------------------------

test('mixed currencies: a currency mismatch between purchase and return is not treated as a match', () => {
  const p = purchase({ currency: 'USD', taxAmount: 100 });
  const r = returnRecord({ currency: 'INR', taxAmount: 100 });
  const rows = reconcileItcRecords([p], [r]);
  assert.equal(rows.length, 2, 'both sides surface independently instead of an incorrect cross-currency match');
  assert.ok(rows.some((row) => row.status === 'missing-in-return'));
  assert.ok(rows.some((row) => row.status === 'return-record-only'));
});

test('mixed currencies: same currency on both sides still matches normally', () => {
  const p = purchase({ currency: 'EUR', taxAmount: 100 });
  const r = returnRecord({ currency: 'EUR', taxAmount: 100 });
  assert.equal(reconcileItcRecords([p], [r])[0].status, 'matched');
});

// --- Deleted / soft-deleted records --------------------------------------------

// The reconciliation engine has no concept of "deleted" -- PurchaseRecord and
// ItcReturnRecord are only ever constructed by the repository layer
// (lib/itcRecovery/repository.ts), whose queries already filter
// `.is('deleted_at', null)` for both tables and exclude draft/void bills for
// the purchase side. A deleted or soft-deleted row structurally never
// reaches this module, so there is nothing for the pure engine itself to
// filter -- this is enforced at the query boundary, not here.

// --- Summary math & percentage --------------------------------------------------

test('summary totals and reconciliation percentage across a realistic mix', () => {
  const rows = reconcileItcRecords(
    [
      purchase({ vendorInvoiceId: 'bill_matched', invoiceNumber: 'INV-A', taxAmount: 1000 }),
      purchase({ vendorInvoiceId: 'bill_mismatch', invoiceNumber: 'INV-B', taxAmount: 500 }),
      purchase({ vendorInvoiceId: 'bill_missing', invoiceNumber: 'INV-C', taxAmount: 300 }),
    ],
    [
      returnRecord({ returnInvoiceNumber: 'INV-A', taxAmount: 1000 }),
      returnRecord({ returnInvoiceNumber: 'INV-B', taxAmount: 400 }),
      returnRecord({ returnInvoiceNumber: 'INV-D', taxAmount: 200 }), // return-record-only
    ],
  );
  const summary = summarizeReconciliation(rows);
  assert.equal(summary.totalPurchaseTax, 1800); // 1000 + 500 + 300 (return-only row has no purchase side)
  assert.equal(summary.totalReturnTax, 1600); // 1000 + 400 + 200
  assert.equal(summary.recoverableItc, 1400); // 1000 (matched) + 400 (min of mismatch pair)
  assert.equal(summary.atRiskItc, 400); // 100 (mismatch gap) + 300 (missing-in-return)
  assert.equal(summary.reconciliationPercentage, Math.round((1400 / 1800) * 1000) / 10);
});

// --- Invoice linking --------------------------------------------------------------

test('matched and mismatched rows retain the purchase record for drill-down linking', () => {
  const p = purchase({ vendorInvoiceId: 'bill_link_me' });
  const rows = reconcileItcRecords([p], [returnRecord()]);
  assert.equal(rows[0].purchaseRecord?.vendorInvoiceId, 'bill_link_me');
});

test('return-record-only rows have no purchase record to link', () => {
  const rows = reconcileItcRecords([], [returnRecord()]);
  assert.equal(rows[0].purchaseRecord, undefined);
});

// --- Determinism & non-mutation --------------------------------------------------

test('results are deterministic across repeated calls with the same input', () => {
  const purchases = [purchase({ vendorInvoiceId: 'bill_x' }), purchase({ vendorInvoiceId: 'bill_y', invoiceNumber: 'INV-2' })];
  const returns = [returnRecord(), returnRecord({ returnInvoiceNumber: 'INV-2' })];
  const first = reconcileItcRecords(purchases, returns);
  const second = reconcileItcRecords(purchases, returns);
  assert.deepEqual(first, second);
});

test('input arrays and their elements are never mutated', () => {
  const purchases = Object.freeze([Object.freeze(purchase())]);
  const returns = Object.freeze([Object.freeze(returnRecord())]);
  assert.doesNotThrow(() => reconcileItcRecords(purchases, returns));
});
