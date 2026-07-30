import type { ReconciliationStatus } from '../types/itcRecovery';

export type ItcStatusBadgeVariant = 'success' | 'danger' | 'warning' | 'neutral';

const currencyLocales: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'en-IE',
};

export const reconciliationStatusLabels: Record<ReconciliationStatus, string> = {
  matched: 'Matched',
  mismatch: 'Mismatch',
  'missing-in-return': 'Missing in Return',
  'return-record-only': 'Return Record Only',
};

export const reconciliationStatusBadgeVariants: Record<ReconciliationStatus, ItcStatusBadgeVariant> = {
  matched: 'success',
  mismatch: 'warning',
  'missing-in-return': 'danger',
  'return-record-only': 'neutral',
};

/** Shared between the CSV and PDF report legends so the wording can never drift between formats. */
export const reconciliationStatusDescriptions: Record<ReconciliationStatus, string> = {
  matched: 'Purchase invoice and filed return agree, within tolerance.',
  mismatch: 'Purchase invoice and filed return amounts differ beyond tolerance.',
  'missing-in-return': 'Purchase invoice has no corresponding filed return record.',
  'return-record-only': 'Filed return record has no corresponding purchase invoice.',
};

export function formatItcCurrency(amount: number, currency: string = 'INR') {
  return new Intl.NumberFormat(currencyLocales[currency] ?? 'en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatItcDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

/** Report generation timestamp, fixed to India Standard Time since ITC/GST is an India-specific concern. */
export function formatItcReportGeneratedAt(iso: string) {
  return `${new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(iso))} IST`;
}
