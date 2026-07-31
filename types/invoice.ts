export const invoiceStatuses = [
  'draft',
  'sent',
  'viewed',
  'partially-paid',
  'paid',
  'overdue',
  'void',
] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number];
export type InvoiceCurrency = 'INR' | 'USD' | 'EUR';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  /** Optional -- most existing line items don't carry one; additive so no
   * existing caller needs to change. */
  discount?: number;
  lineTotal: number;
}

/** One named tax component (e.g. CGST, SGST, IGST) making up an invoice's
 * combined `tax` total. Optional and additive -- an invoice with no
 * taxBreakdown still has a valid `tax` figure, same as before this field
 * existed; mirrors the real invoice_taxes table's columns
 * (db/schema/index.ts) without requiring every caller to handle it. */
export interface InvoiceTaxLine {
  name: string;
  rate: number;
  taxableAmount: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  invoiceDate: string;
  dueDate: string;
  currency: InvoiceCurrency;
  subtotal: number;
  tax: number;
  taxBreakdown?: InvoiceTaxLine[];
  total: number;
  status: InvoiceStatus;
  createdAt: string;
}
