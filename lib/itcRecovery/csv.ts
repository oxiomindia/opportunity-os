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
