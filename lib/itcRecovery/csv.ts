import type { ItcReconciliationReport } from './report';
import { reconciliationStatusLabels, reconciliationStatusDescriptions, formatItcReportGeneratedAt } from '../itcRecoveryFormatters';

/**
 * Minimal CSV parser for the ITC return-record import template. Handles
 * quoted fields (commas/quotes inside a value) without an external
 * dependency -- this repo's CSV needs are small and fixed-shape, so a
 * full RFC 4180 library would be more machinery than the problem needs.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((field) => field.trim());
}

const HEADER_MAP: Record<string, string> = {
  'vendor gstin': 'vendorGstin',
  vendorgstin: 'vendorGstin',
  gstin: 'vendorGstin',
  'vendor name': 'vendorName',
  vendorname: 'vendorName',
  'return invoice number': 'returnInvoiceNumber',
  'invoice number': 'returnInvoiceNumber',
  returninvoicenumber: 'returnInvoiceNumber',
  'invoice date': 'invoiceDate',
  invoicedate: 'invoiceDate',
  'return period': 'returnPeriod',
  returnperiod: 'returnPeriod',
  'taxable value': 'taxableValue',
  taxablevalue: 'taxableValue',
  'tax amount': 'taxAmount',
  taxamount: 'taxAmount',
  currency: 'currency',
};

export interface ParsedItcCsvRow {
  vendorGstin?: string;
  vendorName?: string;
  returnInvoiceNumber?: string;
  invoiceDate?: string;
  returnPeriod?: string;
  taxableValue?: string;
  taxAmount?: string;
  currency?: string;
}

/** Parses the uploaded CSV into rows shaped for import_itc_return_records. Unknown/blank header cells are ignored rather than rejected. */
export function parseItcReturnCsv(text: string): ParsedItcCsvRow[] {
  const lines = text.split(/\r\n|\r|\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headerCells = parseCsvLine(lines[0]).map((cell) => HEADER_MAP[cell.toLowerCase()]);

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row: ParsedItcCsvRow = {};
    headerCells.forEach((key, index) => {
      if (key && cells[index] !== undefined && cells[index] !== '') {
        (row as Record<string, string>)[key] = cells[index];
      }
    });
    return row;
  });
}

/** Quotes a field only when it needs it (contains a comma, quote, or newline), doubling any internal quotes -- standard CSV escaping. */
function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function csvRow(fields: readonly (string | number)[]): string {
  return `${fields.map((field) => escapeCsvField(String(field))).join(',')}\r\n`;
}

/**
 * Builds the exportable CSV for a reconciliation report: title/metadata,
 * summary, a status legend, then one row per reconciled record. Numeric
 * columns are plain fixed-point decimals (no currency symbol or thousands
 * separator) so Excel treats them as real numbers, not text. Prefixed with
 * a UTF-8 BOM for Excel compatibility. CRLF line endings throughout, per
 * RFC 4180.
 */
export function buildItcReconciliationCsv(report: ItcReconciliationReport): string {
  const lines: string[] = [];

  lines.push(csvRow(['Input Tax Credit Reconciliation Report']));
  lines.push(csvRow(['Organization', report.organizationName]));
  lines.push(csvRow(['Return Period', report.period ?? 'All periods']));
  lines.push(csvRow(['Generated', formatItcReportGeneratedAt(report.generatedAt)]));
  lines.push(csvRow([]));

  lines.push(csvRow(['Summary']));
  lines.push(csvRow(['Total Purchase Tax', report.summary.totalPurchaseTax.toFixed(2)]));
  lines.push(csvRow(['Total Return Tax', report.summary.totalReturnTax.toFixed(2)]));
  lines.push(csvRow(['Recoverable ITC', report.summary.recoverableItc.toFixed(2)]));
  lines.push(csvRow(['At-Risk ITC', report.summary.atRiskItc.toFixed(2)]));
  lines.push(csvRow(['Reconciliation Percentage', `${report.summary.reconciliationPercentage}%`]));
  lines.push(csvRow([]));

  lines.push(csvRow(['Legend']));
  (Object.keys(reconciliationStatusLabels) as (keyof typeof reconciliationStatusLabels)[]).forEach((status) => {
    lines.push(csvRow([reconciliationStatusLabels[status], reconciliationStatusDescriptions[status]]));
  });
  lines.push(csvRow([]));

  lines.push(csvRow(['Vendor', 'GSTIN', 'Invoice Number', 'Invoice Date', 'Purchase Tax', 'Return Tax', 'Status', 'Difference']));
  for (const row of report.rows) {
    lines.push(csvRow([
      row.purchaseRecord?.vendorName ?? row.returnRecord?.vendorName ?? '',
      row.purchaseRecord?.vendorGstin ?? row.returnRecord?.vendorGstin ?? '',
      row.purchaseRecord?.invoiceNumber ?? row.returnRecord?.returnInvoiceNumber ?? '',
      (row.purchaseRecord?.invoiceDate ?? row.returnRecord?.invoiceDate ?? '').slice(0, 10),
      row.purchaseRecord ? row.purchaseRecord.taxAmount.toFixed(2) : '',
      row.returnRecord ? row.returnRecord.taxAmount.toFixed(2) : '',
      reconciliationStatusLabels[row.status],
      row.taxDifference !== undefined ? row.taxDifference.toFixed(2) : '',
    ]));
  }

  return '\uFEFF' + lines.join(''); // UTF-8 BOM so Excel opens the file correctly encoded
}
