import 'server-only';

import { requireSessionContext } from '../auth/dal';
import { listItcReturnRecords, listPurchaseRecordsForReconciliation } from './repository';
import { reconcileItcRecords, summarizeReconciliation } from './reconciliation';
import type { ReconciliationRow, ReconciliationSummary } from '../../types/itcRecovery';

export interface ItcReconciliationReport {
  organizationName: string;
  /** The selected return period, or null when showing all periods. */
  period: string | null;
  /** Every distinct period present in the unfiltered data, newest first. */
  periods: string[];
  rows: ReconciliationRow[];
  summary: ReconciliationSummary;
  generatedAt: string;
}

export function rowPeriod(row: ReconciliationRow): string | undefined {
  return row.returnRecord?.returnPeriod ?? row.purchaseRecord?.invoiceDate?.slice(0, 7);
}

/**
 * The single source of truth for reconciliation data. The dashboard, the
 * CSV export, and the PDF export all call this exact function -- there is
 * no separate computation path for exports, so an exported report can
 * never show different totals than what the dashboard displays for the
 * same period.
 */
export async function getItcReconciliationReport(period?: string): Promise<ItcReconciliationReport> {
  const { organization } = await requireSessionContext();
  const [purchaseRecords, returnRecords] = await Promise.all([
    listPurchaseRecordsForReconciliation(),
    listItcReturnRecords(),
  ]);
  // ITC/GST applies to Indian, INR-denominated purchases only -- see reconcileItcRecords'
  // own currency guard for the matching-side half of this same rule.
  const allRows = reconcileItcRecords(purchaseRecords.filter((record) => record.currency === 'INR'), returnRecords);
  const periods = Array.from(new Set(allRows.map(rowPeriod).filter((value): value is string => Boolean(value)))).sort().reverse();
  const rows = period ? allRows.filter((row) => rowPeriod(row) === period) : allRows;
  const summary = summarizeReconciliation(rows);

  return {
    organizationName: organization.name,
    period: period ?? null,
    periods,
    rows,
    summary,
    generatedAt: new Date().toISOString(),
  };
}
