export const invoiceStatuses = [
  'received',
  'processing',
  'needs-review',
  'verified',
  'accounts-review',
  'approved',
  'rejected',
  'payment-ready',
  'paid',
] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number];
export type InvoiceCurrency = 'INR' | 'USD' | 'EUR';
export type InvoiceSource = 'email' | 'manual-upload' | 'vendor-portal' | 'api-import';
export type InvoiceFileType = 'pdf' | 'png' | 'jpg' | 'email';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorEmail?: string;
  invoiceDate: string;
  dueDate: string;
  currency: InvoiceCurrency;
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  confidence: number;
  source: InvoiceSource;
  receivedAt: string;
  assignedTo?: string;
  exceptionCount: number;
  fileName: string;
  fileType: InvoiceFileType;
}
