import assert from 'node:assert/strict';
import test from 'node:test';
import { mockInvoices } from './mockInvoices';
import { mockInvoiceLineItems } from './mockInvoiceLineItems';

function approxEqual(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance;
}

test('exactly 25 demo invoices, per the milestone requirement', () => {
  assert.equal(mockInvoices.length, 25);
});

test('every invoice has a unique id and a unique invoice number', () => {
  const ids = mockInvoices.map((invoice) => invoice.id);
  const numbers = mockInvoices.map((invoice) => invoice.invoiceNumber);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(numbers).size, numbers.length);
});

test('every invoice has at least one line item, and the line items sum to its subtotal', () => {
  for (const invoice of mockInvoices) {
    const items = mockInvoiceLineItems[invoice.id];
    assert.ok(items && items.length > 0, `${invoice.id} must have line items`);
    const sum = items.reduce((total, item) => total + item.lineTotal, 0);
    assert.ok(approxEqual(sum, invoice.subtotal), `${invoice.id}: line items sum to ${sum}, subtotal is ${invoice.subtotal}`);
  }
});

test('subtotal + tax === total for every invoice', () => {
  for (const invoice of mockInvoices) {
    assert.ok(approxEqual(invoice.subtotal + invoice.tax, invoice.total), `${invoice.id}: ${invoice.subtotal} + ${invoice.tax} !== ${invoice.total}`);
  }
});

test('an invoice with a taxBreakdown has its tax lines sum to the invoice tax', () => {
  for (const invoice of mockInvoices.filter((entry) => entry.taxBreakdown)) {
    const sum = invoice.taxBreakdown!.reduce((total, line) => total + line.amount, 0);
    assert.ok(approxEqual(sum, invoice.tax), `${invoice.id}: taxBreakdown sums to ${sum}, tax is ${invoice.tax}`);
  }
});

test('an intra-state invoice splits into CGST + SGST; an inter-state invoice is a single IGST line', () => {
  for (const invoice of mockInvoices.filter((entry) => entry.taxBreakdown)) {
    const names = invoice.taxBreakdown!.map((line) => line.name).sort();
    assert.ok(
      (names.length === 2 && names[0] === 'CGST' && names[1] === 'SGST') || (names.length === 1 && names[0] === 'IGST'),
      `${invoice.id}: unexpected tax breakdown shape ${JSON.stringify(names)}`
    );
  }
});

test('every required invoice status appears at least once: paid, an awaiting-payment status, overdue, and partially-paid', () => {
  const statuses = new Set(mockInvoices.map((invoice) => invoice.status));
  assert.ok(statuses.has('paid'));
  assert.ok(statuses.has('sent') || statuses.has('viewed'), 'at least one "pending" (awaiting payment) status');
  assert.ok(statuses.has('overdue'));
  assert.ok(statuses.has('partially-paid'));
});

test('multiple currencies and multiple customers are represented', () => {
  assert.ok(new Set(mockInvoices.map((invoice) => invoice.currency)).size >= 2);
  assert.ok(new Set(mockInvoices.map((invoice) => invoice.customerName)).size >= 5);
});
