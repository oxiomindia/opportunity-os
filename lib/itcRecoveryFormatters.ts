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
