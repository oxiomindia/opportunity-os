import { registerReport } from '../urp/registry';
import type { ReportDefinition, RenderedReport } from '../urp/types';
import type { ItcReconciliationReport } from './report';
import { renderItcReconciliationPdfBuffer } from './pdf';
import { buildItcReconciliationCsv } from './csv';
import { reconciliationStatusLabels, formatItcCurrency, formatItcReportGeneratedAt } from '../itcRecoveryFormatters';

/**
 * ITC Reconciliation as a URP report. This is the platform's first real
 * report, wired through the Universal Report Platform end to end -- it
 * demonstrates the pipeline, it does not replace the existing dedicated
 * /api/itc-recovery/export/{csv,pdf} routes, which are unchanged and keep
 * working exactly as before.
 *
 * PDF and CSV templates below call the existing renderers
 * (renderItcReconciliationPdfBuffer, buildItcReconciliationCsv) directly --
 * no rendering logic is duplicated. JSON/Markdown/HTML are genuinely new
 * (ITC Recovery had no such export before), built from the same
 * ItcReconciliationReport data and the same shared formatters the existing
 * renderers use, so wording and numbers can't drift between formats.
 */
export interface ItcReconciliationReportInput {
  period?: string;
}

function filenameFor(period: string | null, extension: string): string {
  return `itc-recovery-reconciliation-${period ?? 'all-periods'}.${extension}`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const escapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return escapes[char] ?? char;
  });
}

function vendorName(row: ItcReconciliationReport['rows'][number]): string {
  return row.purchaseRecord?.vendorName ?? row.returnRecord?.vendorName ?? '';
}

function vendorGstin(row: ItcReconciliationReport['rows'][number]): string {
  return row.purchaseRecord?.vendorGstin ?? row.returnRecord?.vendorGstin ?? '';
}

function invoiceNumber(row: ItcReconciliationReport['rows'][number]): string {
  return row.purchaseRecord?.invoiceNumber ?? row.returnRecord?.returnInvoiceNumber ?? '';
}

function buildJson(report: ItcReconciliationReport): RenderedReport {
  return {
    content: JSON.stringify(report, null, 2),
    contentType: 'application/json',
    filename: filenameFor(report.period, 'json'),
  };
}

function buildMarkdown(report: ItcReconciliationReport): RenderedReport {
  const lines: string[] = [
    '# Input Tax Credit Reconciliation Report',
    '',
    `**Organization:** ${report.organizationName}`,
    `**Return period:** ${report.period ?? 'All periods'}`,
    `**Generated:** ${formatItcReportGeneratedAt(report.generatedAt)}`,
    '',
    '## Summary',
    '',
    `- Total Purchase Tax: ${formatItcCurrency(report.summary.totalPurchaseTax)}`,
    `- Total Return Tax: ${formatItcCurrency(report.summary.totalReturnTax)}`,
    `- Recoverable ITC: ${formatItcCurrency(report.summary.recoverableItc)}`,
    `- At-Risk ITC: ${formatItcCurrency(report.summary.atRiskItc)}`,
    `- Reconciliation %: ${report.summary.reconciliationPercentage}%`,
    '',
    `## Records (${report.rows.length})`,
    '',
    '| Vendor | GSTIN | Invoice Number | Status |',
    '| --- | --- | --- | --- |',
  ];
  for (const row of report.rows) {
    lines.push(`| ${vendorName(row)} | ${vendorGstin(row)} | ${invoiceNumber(row)} | ${reconciliationStatusLabels[row.status]} |`);
  }
  return {
    content: lines.join('\n'),
    contentType: 'text/markdown; charset=utf-8',
    filename: filenameFor(report.period, 'md'),
  };
}

function buildHtml(report: ItcReconciliationReport): RenderedReport {
  const rows = report.rows
    .map(
      (row) =>
        `<tr><td>${escapeHtml(vendorName(row))}</td><td>${escapeHtml(vendorGstin(row))}</td><td>${escapeHtml(invoiceNumber(row))}</td><td>${escapeHtml(reconciliationStatusLabels[row.status])}</td></tr>`
    )
    .join('');

  const content = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Input Tax Credit Reconciliation Report</title></head>
<body>
<h1>Input Tax Credit Reconciliation Report</h1>
<p><strong>Organization:</strong> ${escapeHtml(report.organizationName)}</p>
<p><strong>Return period:</strong> ${escapeHtml(report.period ?? 'All periods')}</p>
<p><strong>Generated:</strong> ${escapeHtml(formatItcReportGeneratedAt(report.generatedAt))}</p>
<h2>Summary</h2>
<ul>
<li>Total Purchase Tax: ${formatItcCurrency(report.summary.totalPurchaseTax)}</li>
<li>Total Return Tax: ${formatItcCurrency(report.summary.totalReturnTax)}</li>
<li>Recoverable ITC: ${formatItcCurrency(report.summary.recoverableItc)}</li>
<li>At-Risk ITC: ${formatItcCurrency(report.summary.atRiskItc)}</li>
<li>Reconciliation %: ${report.summary.reconciliationPercentage}%</li>
</ul>
<h2>Records (${report.rows.length})</h2>
<table border="1" cellspacing="0" cellpadding="4">
<thead><tr><th>Vendor</th><th>GSTIN</th><th>Invoice Number</th><th>Status</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</body>
</html>`;

  return { content, contentType: 'text/html; charset=utf-8', filename: filenameFor(report.period, 'html') };
}

export const itcReconciliationUrpReport: ReportDefinition<ItcReconciliationReportInput, ItcReconciliationReport> = {
  metadata: {
    id: 'itc-reconciliation',
    name: 'Input Tax Credit Reconciliation Report',
    description: 'Purchase-side tax reconciled against filed GST return records, by return period.',
    version: '1.0.0',
    category: 'tax',
    sourceEngine: 'itc-recovery',
    inputSchema: 'period?: string (YYYY-MM) -- omit for all periods',
  },

  validateInput(input) {
    if (input?.period !== undefined && !/^\d{4}-\d{2}$/.test(input.period)) {
      return { ok: false, errors: ['period must be in YYYY-MM format when provided'] };
    }
    return { ok: true, data: input ?? {} };
  },

  async loadData(input) {
    // Lazy import, not a static one: report.ts carries a 'server-only'
    // guard that only Next.js's bundler stubs out -- a static import here
    // would make this whole module (and therefore its pure render
    // functions) impossible to unit-test under the plain tsx/node test
    // runner. Deferring the import to call time keeps loadData's real
    // behavior identical while templates/validateInput stay testable in
    // isolation (see urpReport.test.ts).
    const { getItcReconciliationReport } = await import('./report');
    return getItcReconciliationReport(input.period);
  },

  templates: {
    json: { render: buildJson },
    markdown: { render: buildMarkdown },
    html: { render: buildHtml },
    csv: {
      render(report) {
        return { content: buildItcReconciliationCsv(report), contentType: 'text/csv; charset=utf-8', filename: filenameFor(report.period, 'csv') };
      },
    },
    pdf: {
      async render(report) {
        const buffer = await renderItcReconciliationPdfBuffer(report);
        return { content: buffer, contentType: 'application/pdf', filename: filenameFor(report.period, 'pdf') };
      },
    },
  },
};

registerReport(itcReconciliationUrpReport);
