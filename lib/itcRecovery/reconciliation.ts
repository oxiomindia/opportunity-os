import type { ItcReturnRecord, PurchaseRecord, ReconciliationRow, ReconciliationSummary } from '../../types/itcRecovery';

const DEFAULT_TOLERANCE = 1;

function matchKey(gstin: string | undefined, invoiceNumber: string): string | null {
  const normalizedGstin = gstin?.trim().toUpperCase();
  const normalizedInvoice = invoiceNumber.trim().toUpperCase();
  if (!normalizedGstin || !normalizedInvoice) return null;
  return `${normalizedGstin}::${normalizedInvoice}`;
}

/**
 * Matches purchase invoices against filed-return records by vendor GSTIN +
 * invoice number. Pure and I/O-free by design, so it stays independently
 * testable regardless of how its two inputs were fetched.
 */
export function reconcileItcRecords(
  purchaseRecords: readonly PurchaseRecord[],
  returnRecords: readonly ItcReturnRecord[],
  amountTolerance: number = DEFAULT_TOLERANCE,
): ReconciliationRow[] {
  const returnByKey = new Map<string, ItcReturnRecord>();
  for (const returnRecord of returnRecords) {
    const key = matchKey(returnRecord.vendorGstin, returnRecord.returnInvoiceNumber);
    if (key) returnByKey.set(key, returnRecord);
  }

  const matchedReturnKeys = new Set<string>();
  const rows: ReconciliationRow[] = [];

  for (const purchaseRecord of purchaseRecords) {
    const key = matchKey(purchaseRecord.vendorGstin, purchaseRecord.invoiceNumber);
    const returnRecord = key ? returnByKey.get(key) : undefined;

    if (!returnRecord) {
      rows.push({ status: 'missing-in-return', purchaseRecord });
      continue;
    }

    if (key) matchedReturnKeys.add(key);
    const taxDifference = purchaseRecord.taxAmount - returnRecord.taxAmount;
    if (Math.abs(taxDifference) <= amountTolerance) {
      rows.push({ status: 'matched', purchaseRecord, returnRecord });
    } else {
      rows.push({ status: 'mismatch', purchaseRecord, returnRecord, taxDifference });
    }
  }

  for (const [key, returnRecord] of returnByKey) {
    if (!matchedReturnKeys.has(key)) rows.push({ status: 'return-record-only', returnRecord });
  }

  return rows;
}

export function summarizeReconciliation(rows: readonly ReconciliationRow[]): ReconciliationSummary {
  let totalPurchaseTax = 0;
  let totalReturnTax = 0;
  let recoverableItc = 0;
  let atRiskItc = 0;

  for (const row of rows) {
    if (row.purchaseRecord) totalPurchaseTax += row.purchaseRecord.taxAmount;
    if (row.returnRecord) totalReturnTax += row.returnRecord.taxAmount;

    if (row.status === 'matched') {
      recoverableItc += row.purchaseRecord!.taxAmount;
    } else if (row.status === 'mismatch') {
      // Only the lower of the two figures is safely recoverable; the gap is at risk.
      const safe = Math.min(row.purchaseRecord!.taxAmount, row.returnRecord!.taxAmount);
      recoverableItc += safe;
      atRiskItc += Math.abs(row.taxDifference ?? 0);
    } else if (row.status === 'missing-in-return') {
      atRiskItc += row.purchaseRecord!.taxAmount;
    }
    // 'return-record-only' rows don't affect purchase-side recoverable/at-risk totals --
    // there's no purchase invoice claiming that credit yet.
  }

  const reconciliationPercentage = totalPurchaseTax > 0 ? Math.round((recoverableItc / totalPurchaseTax) * 1000) / 10 : 0;

  return { totalPurchaseTax, totalReturnTax, recoverableItc, atRiskItc, reconciliationPercentage };
}
