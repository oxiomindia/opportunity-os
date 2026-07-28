import type { InvoiceCurrency, InvoiceStatus } from '../types/invoice';

export type InvoiceStatusBadgeVariant = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'accent';

const currencyLocales: Record<InvoiceCurrency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'en-IE',
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  'partially-paid': 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};

export const invoiceStatusBadgeVariants: Record<InvoiceStatus, InvoiceStatusBadgeVariant> = {
  draft: 'neutral',
  sent: 'info',
  viewed: 'accent',
  'partially-paid': 'warning',
  paid: 'success',
  overdue: 'danger',
  void: 'neutral',
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
