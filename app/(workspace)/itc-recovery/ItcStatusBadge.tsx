import { reconciliationStatusBadgeVariants, reconciliationStatusLabels } from '../../../lib/itcRecoveryFormatters';
import type { ReconciliationStatus } from '../../../types/itcRecovery';

const badgeClasses = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
} as const;

export default function ItcStatusBadge({ status }: Readonly<{ status: ReconciliationStatus }>) {
  const variant = reconciliationStatusBadgeVariants[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClasses[variant]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {reconciliationStatusLabels[status]}
    </span>
  );
}
