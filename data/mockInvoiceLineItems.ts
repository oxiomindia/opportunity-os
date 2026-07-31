import { computedMockInvoiceLineItems } from './mockInvoiceSpecs';
import type { InvoiceLineItem } from '../types/invoice';

/** Line items for each of the 25 demo invoices in data/mockInvoices.ts,
 * keyed by invoice id. See data/mockInvoiceSpecs.ts for the source data. */
export const mockInvoiceLineItems: Record<string, InvoiceLineItem[]> = computedMockInvoiceLineItems;
