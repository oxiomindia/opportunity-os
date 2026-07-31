import { computedMockInvoices } from './mockInvoiceSpecs';

/**
 * 25 demo invoices -- unique numbers, 10 customers, a spread of dates,
 * statuses, currencies, and GST combinations (intra-state CGST+SGST,
 * inter-state IGST, and export/foreign no-GST). Computed from
 * data/mockInvoiceSpecs.ts's line items rather than hand-typed here, so
 * subtotal/tax/total can never drift out of arithmetic agreement with the
 * line items data/mockInvoiceLineItems.ts exports for the same invoices.
 */
export const mockInvoices = computedMockInvoices;
