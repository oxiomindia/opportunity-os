import type { ItcReturnRecord, PurchaseRecord, ReconciliationRow, ReconciliationSummary } from '../../types/itcRecovery';

/**
 * Default amount-tolerance in currency units (e.g. rupees), not paise --
 * ReconciliationRow amounts are plain decimal numbers throughout this
 * module. A small tolerance absorbs paise-level rounding differences
 * between how a purchase invoice and a filed return each round tax,
 * without masking a genuine mismatch.
 */
const DEFAULT_TOLERANCE = 1;

/**
 * The match key a purchase invoice and a filed-return line must share to
 * be considered the same transaction: vendor GSTIN + invoice number,
 * case- and whitespace-insensitive (GST filings and manual entry are
 * inconsistent about casing, e.g. "mo-8841" vs "MO-8841"). Returns null
 * when either half is missing, since an unset GSTIN or invoice number
 * can never be matched to anything -- it always falls through to
 * 'missing-in-return' / 'return-record-only'.
 */
function matchKey(gstin: string | undefined, invoiceNumber: string): string | null {
  const normalizedGstin = gstin?.trim().toUpperCase();
  const normalizedInvoice = invoiceNumber.trim().toUpperCase();
  if (!normalizedGstin || !normalizedInvoice) return null;
  return `${normalizedGstin}::${normalizedInvoice}`;
}

/**
 * Matches purchase invoices against filed-return records by vendor GSTIN +
 * invoice number. Pure and I/O-free by design -- no database, no UI, no
 * hidden state -- so it stays independently testable and reusable
 * regardless of how its two inputs were fetched. Never mutates its
 * inputs; always returns a fresh array.
 *
 * Duplicate handling: matching is done through a per-key queue rather
 * than a plain map, so if either side legitimately contains more than
 * one record under the same key (e.g. two return-record entries somehow
 * sharing a GSTIN+invoice number), each purchase record only ever
 * consumes one return record, and a return record is only ever consumed
 * once. This is what stops two purchase invoices from both being able to
 * claim the same filed credit (which would double-count recoverable ITC)
 * and stops a duplicate return-record entry from silently overwriting an
 * earlier one -- every record on both sides always appears exactly once
 * in the output. Consumption order follows input order (first purchase
 * record to claim a key wins), which is why the result is deterministic
 * for a given input order.
 *
 * Currency guard: a match is only honored when both sides share the same
 * currency. Indian GST/ITC filings are always INR, so in practice this
 * only matters if a caller passes in non-INR data by mistake -- treating
 * a currency-mismatched pair as unrelated (rather than silently comparing
 * unlike amounts) keeps the engine safe to reuse even if a future caller
 * forgets to pre-filter by currency the way the dashboard does today.
 *
 * Extending in V2: additional statuses, a configurable match key (e.g.
 * adding taxable value as a secondary key), or period-aware matching can
 * all be added without touching callers, since ReconciliationRow's status
 * union and this function's signature are the only public contract.
 */
export function reconcileItcRecords(
  purchaseRecords: readonly PurchaseRecord[],
  returnRecords: readonly ItcReturnRecord[],
  amountTolerance: number = DEFAULT_TOLERANCE,
): ReconciliationRow[] {
  const returnQueuesByKey = new Map<string, ItcReturnRecord[]>();
  for (const returnRecord of returnRecords) {
    const key = matchKey(returnRecord.vendorGstin, returnRecord.returnInvoiceNumber);
    if (!key) continue;
    const queue = returnQueuesByKey.get(key);
    if (queue) queue.push(returnRecord);
    else returnQueuesByKey.set(key, [returnRecord]);
  }

  const rows: ReconciliationRow[] = [];

  for (const purchaseRecord of purchaseRecords) {
    const key = matchKey(purchaseRecord.vendorGstin, purchaseRecord.invoiceNumber);
    const queue = key ? returnQueuesByKey.get(key) : undefined;
    const candidate = queue && queue.length > 0 ? queue[0] : undefined;
    const returnRecord = candidate && candidate.currency === purchaseRecord.currency ? candidate : undefined;

    if (!returnRecord) {
      rows.push({ status: 'missing-in-return', purchaseRecord });
      continue;
    }

    queue!.shift(); // consume this return record so nothing else can claim it
    const taxDifference = purchaseRecord.taxAmount - returnRecord.taxAmount;
    if (Math.abs(taxDifference) <= amountTolerance) {
      rows.push({ status: 'matched', purchaseRecord, returnRecord });
    } else {
      rows.push({ status: 'mismatch', purchaseRecord, returnRecord, taxDifference });
    }
  }

  // Anything left in a queue -- including every extra duplicate beyond
  // the first -- was never claimed by a purchase record.
  for (const queue of returnQueuesByKey.values()) {
    for (const returnRecord of queue) rows.push({ status: 'return-record-only', returnRecord });
  }

  return rows;
}

/**
 * Totals a set of already-classified reconciliation rows. Pure, no I/O.
 * Assumes every amount in `rows` is already in a single consistent
 * currency -- the caller is responsible for that (the dashboard only
 * ever reconciles INR records; see reconcileItcRecords' currency guard
 * for the matching side of that same rule).
 */
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
