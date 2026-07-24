import type { InvoiceCurrency, InvoiceStatus } from '../types/invoice';

export type InvoiceStatusBadgeVariant = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'accent';

const currencyLocales: Record<InvoiceCurrency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'en-IE',
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  received: 'Received',
  processing: 'Processing',
  'needs-review': 'Needs review',
  verified: 'Verified',
  'accounts-review': 'Accounts review',
  approved: 'Approved',
  rejected: 'Rejected',
  'payment-ready': 'Payment ready',
  paid: 'Paid',
};

export const invoiceStatusBadgeVariants: Record<InvoiceStatus, InvoiceStatusBadgeVariant> = {
  received: 'neutral',
  processing: 'info',
  'needs-review': 'warning',
  verified: 'success',
  'accounts-review': 'accent',
  approved: 'success',
  rejected: 'danger',
  'payment-ready': 'info',
  paid: 'success',
};

export function formatInvoiceCurrency(amount: number, currency: InvoiceCurrency) {
  return new Intl.NumberFormat(currencyLocales[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatInvoiceDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function getInvoiceStatusLabel(status: InvoiceStatus) {
  return invoiceStatusLabels[status];
}

export function getInvoiceStatusBadgeVariant(status: InvoiceStatus) {
  return invoiceStatusBadgeVariants[status];
}
