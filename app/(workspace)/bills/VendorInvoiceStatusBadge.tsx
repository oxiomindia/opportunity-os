import { getVendorInvoiceStatusBadgeVariant, getVendorInvoiceStatusLabel } from '../../../lib/vendorInvoiceFormatters';
import type { VendorInvoiceStatus } from '../../../types/vendorInvoice';

const badgeClasses = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
  accent: 'border-violet-200 bg-violet-50 text-violet-700',
} as const;

export default function VendorInvoiceStatusBadge({ status }: Readonly<{ status: VendorInvoiceStatus }>) {
  const variant = getVendorInvoiceStatusBadgeVariant(status);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClasses[variant]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {getVendorInvoiceStatusLabel(status)}
    </span>
  );
}
