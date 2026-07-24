import type { Invoice } from '../types/invoice';
import type { ExtractedField, ExtractedFieldKey, ExtractionLineItem, ExtractionResult, ExtractionQueueStatus } from '../types/extraction';
import { buildValidationIssues } from './extractionValidation';

const fieldLabels: Record<ExtractedFieldKey, string> = {
  vendorName: 'Vendor name',
  vendorTaxIdentifier: 'Vendor tax identifier / GSTIN',
  vendorEmail: 'Vendor email',
  invoiceNumber: 'Invoice number',
  invoiceDate: 'Invoice date',
  dueDate: 'Due date',
  currency: 'Currency',
  subtotal: 'Subtotal',
  taxAmount: 'Tax amount',
  totalAmount: 'Total amount',
  purchaseOrderNumber: 'Purchase order number',
  paymentTerms: 'Payment terms',
  bankAccountEnding: 'Bank account ending',
  notes: 'Notes',
};

function hashText(value: string) {
  return [...value].reduce((sum, character, index) => sum + character.charCodeAt(0) * (index + 3), 0);
}

export function shouldExtractionFail(invoice: Invoice) {
  return invoice.id.endsWith('1010') || invoice.fileName.toLowerCase().includes('fail');
}

function confidence(invoice: Invoice, offset: number) {
  return Math.max(45, Math.min(99, invoice.confidence + ((hashText(invoice.id) + offset) % 23) - 11));
}

function field(key: ExtractedFieldKey, invoice: Invoice, value: string, offset: number, sourceHint = 'Simulated page 1 region'): ExtractedField {
  return {
    key,
    label: fieldLabels[key],
    value,
    simulatedValue: value,
    confidence: confidence(invoice, offset),
    sourceHint,
    reviewStatus: 'Unreviewed',
    edited: false,
  };
}

function taxIdentifier(invoice: Invoice) {
  if (invoice.currency !== 'INR') return invoice.id.endsWith('1001') ? '27ABCDE1234F1Z5' : '';
  return invoice.id.endsWith('1005') ? '' : '27AABCU9603R1ZX';
}

function paymentTerms(invoice: Invoice) {
  const days = Math.max(0, Math.round((new Date(invoice.dueDate).getTime() - new Date(invoice.invoiceDate).getTime()) / 86400000));
  return days > 0 ? `Net ${days}` : 'Due on receipt';
}

function buildLineItems(invoice: Invoice): ExtractionLineItem[] {
  const seed = hashText(invoice.id);
  const first = Math.round(invoice.subtotal * 0.62 * 100) / 100;
  const second = Math.round((invoice.subtotal - first) * 100) / 100;
  return [
    { id: `${invoice.id}-line-1`, description: `${invoice.vendorName.split(' ')[0]} service package`, quantity: 1, unitPrice: first, tax: Math.round(invoice.tax * 0.62 * 100) / 100, total: first, confidence: Math.max(50, Math.min(99, invoice.confidence + (seed % 9) - 4)) },
    { id: `${invoice.id}-line-2`, description: 'Operations and support fees', quantity: 1, unitPrice: second, tax: Math.round((invoice.tax - Math.round(invoice.tax * 0.62 * 100) / 100) * 100) / 100, total: second, confidence: Math.max(50, Math.min(99, invoice.confidence + (seed % 13) - 6)) },
  ];
}

export function createSimulatedExtractionResult(invoice: Invoice, processedAt = '2026-07-24T09:30:00Z'): ExtractionResult {
  const lineItems = buildLineItems(invoice);
  const values: Record<ExtractedFieldKey, string> = {
    vendorName: invoice.vendorName,
    vendorTaxIdentifier: taxIdentifier(invoice),
    vendorEmail: invoice.vendorEmail ?? (invoice.id.endsWith('1007') ? 'invalid-email' : ''),
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.id.endsWith('1009') ? '2026-07-01' : invoice.dueDate,
    currency: invoice.currency,
    subtotal: String(invoice.subtotal),
    taxAmount: String(invoice.tax),
    totalAmount: invoice.id.endsWith('1003') ? String(invoice.total + 10) : String(invoice.total),
    purchaseOrderNumber: invoice.id.endsWith('1007') || invoice.id.startsWith('upload_') ? '' : `PO-${hashText(invoice.id).toString().slice(0, 5)}`,
    paymentTerms: paymentTerms(invoice),
    bankAccountEnding: `•••• ${String(1000 + (hashText(invoice.fileName) % 8999))}`,
    notes: 'Local extraction simulation generated from deterministic invoice metadata. No real OCR or AI processing occurred.',
  };
  const fields = Object.fromEntries((Object.keys(values) as ExtractedFieldKey[]).map((key, index) => [key, field(key, invoice, values[key], index * 5 + 3)])) as Record<ExtractedFieldKey, ExtractedField>;
  const validationIssues = buildValidationIssues(values, lineItems);
  const lowConfidenceIssues = Object.values(fields)
    .filter((item) => item.confidence < 70)
    .slice(0, 3)
    .map((item) => ({ id: `low-${item.key}`, severity: 'Warning' as const, fieldKey: item.key, message: `${item.label} has low confidence (${item.confidence}%).` }));
  const issues = [...validationIssues, ...lowConfidenceIssues];
  const overallConfidence = Math.round(Object.values(fields).reduce((sum, item) => sum + item.confidence, 0) / Object.values(fields).length);
  const status: ExtractionQueueStatus = shouldExtractionFail(invoice) ? 'failed' : issues.some((item) => item.severity !== 'Info') || overallConfidence < 85 ? 'needs-review' : 'extracted';
  return {
    invoiceId: invoice.id,
    invoice,
    status,
    stage: status === 'failed' ? 'Validating Values' : 'Complete',
    progress: status === 'failed' ? 82 : 100,
    overallConfidence,
    lastProcessedAt: processedAt,
    fields,
    lineItems,
    issues: status === 'failed' ? [{ id: 'simulated-failure', severity: 'Error', message: 'Deterministic local simulation failed for this document. Retry or reset to continue.' }, ...issues] : issues,
    activity: [{ id: `${invoice.id}-created`, at: processedAt, message: 'Local extraction simulation completed in this browser session.' }],
    currency: invoice.currency,
  };
}

export function getInitialExtractionStatus(invoice: Invoice): ExtractionQueueStatus {
  if (invoice.status === 'needs-review' || invoice.confidence < 70) return 'needs-review';
  if (invoice.status === 'processing') return 'not-started';
  return 'extracted';
}
