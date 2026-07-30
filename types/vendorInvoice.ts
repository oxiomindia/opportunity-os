export const vendorInvoiceStatuses = [
  'draft',
  'pending-approval',
  'approved',
  'payment-scheduled',
  'partially-paid',
  'paid',
  'void',
] as const;

export type VendorInvoiceStatus = (typeof vendorInvoiceStatuses)[number];
export type VendorInvoiceCurrency = 'INR' | 'USD' | 'EUR';

export interface VendorInvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  lineTotal: number;
}

export interface VendorInvoiceAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface VendorInvoice {
  id: string;
  vendorInvoiceNumber?: string;
  vendorName: string;
  vendorEmail?: string;
  invoiceDate: string;
  dueDate: string;
  currency: VendorInvoiceCurrency;
  subtotal: number;
  tax: number;
  total: number;
  status: VendorInvoiceStatus;
  paymentScheduledDate?: string;
  paymentReference?: string;
  createdAt: string;
}
