import type { ExtractedFieldKey, ExtractionIssue, ExtractionLineItem } from '../types/extraction';

function toCents(value: string | number) {
  const numeric = typeof value === 'number' ? value : Number(value.replace(/[^0-9.-]/g, ''));
  return Math.round(numeric * 100);
}

function issue(id: string, severity: ExtractionIssue['severity'], message: string, fieldKey?: ExtractionIssue['fieldKey']): ExtractionIssue {
  return { id, severity, message, fieldKey };
}

export function validateEmail(value: string) {
  if (!value) return 'Vendor email is missing.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Vendor email format is invalid.';
}

export function validateGstin(value: string) {
  if (!value) return 'Vendor tax identifier is missing.';
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value) ? undefined : 'GSTIN format should match the Indian GSTIN pattern.';
}

export function validateDateOrder(invoiceDate: string, dueDate: string) {
  if (!invoiceDate || !dueDate) return 'Invoice date and due date are required.';
  return new Date(dueDate).getTime() >= new Date(invoiceDate).getTime() ? undefined : 'Due date is before invoice date.';
}

export function validateMoney(subtotal: string, tax: string, total: string) {
  return Math.abs(toCents(subtotal) + toCents(tax) - toCents(total)) <= 1 ? undefined : 'Subtotal plus tax does not match total.';
}

export function validateLineItems(lineItems: ExtractionLineItem[], subtotal: string) {
  const lineTotal = lineItems.reduce((sum, item) => sum + toCents(item.total), 0);
  return Math.abs(lineTotal - toCents(subtotal)) <= 1 ? undefined : 'Line-item totals do not match subtotal.';
}

export function buildValidationIssues(values: Record<ExtractedFieldKey, string>, lineItems: ExtractionLineItem[]) {
  const issues: ExtractionIssue[] = [];
  const emailIssue = validateEmail(values.vendorEmail);
  if (emailIssue) issues.push(issue('issue-email', 'Warning', emailIssue, 'vendorEmail'));
  const gstinIssue = values.currency === 'INR' ? validateGstin(values.vendorTaxIdentifier) : undefined;
  if (gstinIssue) issues.push(issue('issue-gstin', 'Warning', gstinIssue, 'vendorTaxIdentifier'));
  const dateIssue = validateDateOrder(values.invoiceDate, values.dueDate);
  if (dateIssue) issues.push(issue('issue-date', 'Error', dateIssue, 'dueDate'));
  const moneyIssue = validateMoney(values.subtotal, values.taxAmount, values.totalAmount);
  if (moneyIssue) issues.push(issue('issue-total', 'Error', moneyIssue, 'totalAmount'));
  const lineIssue = validateLineItems(lineItems, values.subtotal);
  if (lineIssue) issues.push(issue('issue-lines', 'Warning', lineIssue, 'lineItems'));
  if (!values.purchaseOrderNumber) issues.push(issue('issue-po', 'Info', 'Purchase order number is missing.', 'purchaseOrderNumber'));
  return issues;
}
