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
  lineTotal: number;
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
  total: number;
  status: InvoiceStatus;
  createdAt: string;
}
