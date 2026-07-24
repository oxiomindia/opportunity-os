import type { Invoice, InvoiceCurrency } from './invoice';

export const extractionQueueStatuses = ['not-started', 'processing', 'extracted', 'needs-review', 'failed'] as const;
export const extractionStages = ['Queued', 'Reading Document', 'Detecting Fields', 'Validating Values', 'Complete'] as const;
export const extractionReviewStatuses = ['Unreviewed', 'Accepted', 'Corrected', 'Rejected'] as const;
export const extractionIssueSeverities = ['Info', 'Warning', 'Error'] as const;

export type ExtractionQueueStatus = (typeof extractionQueueStatuses)[number];
export type ExtractionStage = (typeof extractionStages)[number];
export type ExtractionReviewStatus = (typeof extractionReviewStatuses)[number];
export type ExtractionIssueSeverity = (typeof extractionIssueSeverities)[number];
export type ExtractionConfidenceCategory = 'High' | 'Medium' | 'Low';
export type ExtractedFieldKey =
  | 'vendorName'
  | 'vendorTaxIdentifier'
  | 'vendorEmail'
  | 'invoiceNumber'
  | 'invoiceDate'
  | 'dueDate'
  | 'currency'
  | 'subtotal'
  | 'taxAmount'
  | 'totalAmount'
  | 'purchaseOrderNumber'
  | 'paymentTerms'
  | 'bankAccountEnding'
  | 'notes';

export interface ExtractionIssue {
  id: string;
  fieldKey?: ExtractedFieldKey | 'lineItems';
  severity: ExtractionIssueSeverity;
  message: string;
}

export interface ExtractedField {
  key: ExtractedFieldKey;
  label: string;
  value: string;
  simulatedValue: string;
  confidence: number;
  sourceHint: string;
  reviewStatus: ExtractionReviewStatus;
  validationIssue?: string;
  edited: boolean;
}

export interface ExtractionLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
  confidence: number;
}

export interface ExtractionActivityEntry {
  id: string;
  at: string;
  message: string;
}

export interface ExtractionResult {
  invoiceId: string;
  invoice: Invoice;
  status: ExtractionQueueStatus;
  stage: ExtractionStage;
  progress: number;
  overallConfidence: number;
  lastProcessedAt?: string;
  fields: Record<ExtractedFieldKey, ExtractedField>;
  lineItems: ExtractionLineItem[];
  issues: ExtractionIssue[];
  activity: ExtractionActivityEntry[];
  currency: InvoiceCurrency;
}

export interface ExtractionQueueItem {
  invoice: Invoice;
  result?: ExtractionResult;
  status: ExtractionQueueStatus;
  overallConfidence: number;
  lastProcessedAt?: string;
  issueCount: number;
}
