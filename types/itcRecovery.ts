export interface ItcReturnRecord {
  id: string;
  vendorId?: string;
  vendorName: string;
  vendorGstin: string;
  returnInvoiceNumber: string;
  invoiceDate?: string;
  returnPeriod: string;
  taxableValue: number;
  taxAmount: number;
  currency: string;
  source: 'manual' | 'import';
  createdAt: string;
}

/** The purchase (AP) side of a reconciliation, read from vendor_invoices/vendors. */
export interface PurchaseRecord {
  vendorInvoiceId: string;
  vendorName: string;
  vendorGstin?: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxAmount: number;
  currency: string;
}

export type ReconciliationStatus = 'matched' | 'mismatch' | 'missing-in-return' | 'return-record-only';

export interface ReconciliationRow {
  status: ReconciliationStatus;
  purchaseRecord?: PurchaseRecord;
  returnRecord?: ItcReturnRecord;
  /** purchaseRecord.taxAmount - returnRecord.taxAmount, only set for 'mismatch' rows. */
  taxDifference?: number;
}

export interface ReconciliationSummary {
  totalPurchaseTax: number;
  totalReturnTax: number;
  recoverableItc: number;
  atRiskItc: number;
  /** recoverableItc / totalPurchaseTax * 100, 0 when there is no purchase tax to reconcile. */
  reconciliationPercentage: number;
}
