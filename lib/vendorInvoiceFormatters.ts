import type { VendorInvoiceCurrency, VendorInvoiceStatus } from '../types/vendorInvoice';

export type VendorInvoiceStatusBadgeVariant = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'accent';

const currencyLocales: Record<VendorInvoiceCurrency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'en-IE',
};

export const vendorInvoiceStatusLabels: Record<VendorInvoiceStatus, string> = {
  draft: 'Draft',
  'pending-approval': 'Pending approval',
  approved: 'Approved',
  'payment-scheduled': 'Payment scheduled',
  'partially-paid': 'Partially paid',
  paid: 'Paid',
  void: 'Void',
};

export const vendorInvoiceStatusBadgeVariants: Record<VendorInvoiceStatus, VendorInvoiceStatusBadgeVariant> = {
  draft: 'neutral',
  'pending-approval': 'info',
  approved: 'accent',
  'payment-scheduled': 'warning',
  'partially-paid': 'warning',
  paid: 'success',
  void: 'neutral',
};

export function formatVendorInvoiceCurrency(amount: number, currency: VendorInvoiceCurrency) {
  return new Intl.NumberFormat(currencyLocales[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatVendorInvoiceDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function getVendorInvoiceStatusLabel(status: VendorInvoiceStatus) {
  return vendorInvoiceStatusLabels[status];
}

export function getVendorInvoiceStatusBadgeVariant(status: VendorInvoiceStatus) {
  return vendorInvoiceStatusBadgeVariants[status];
}
