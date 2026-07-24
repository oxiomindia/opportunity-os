'use client';

import Link from 'next/link';
import { formatInvoiceCurrency, formatInvoiceDate } from '../../../../lib/invoiceFormatters';
import type { ExtractedField, ExtractedFieldKey } from '../../../../types/extraction';
import { useExtraction } from '../../../components/ExtractionProvider';
import { ExtractionConfidenceBadge, ExtractionStatusBadge, IssueSeverityBadge } from '../ExtractionBadges';
import ExtractionProgress from '../ExtractionProgress';
import ExtractionSessionNotice from '../ExtractionSessionNotice';

const editableFieldKeys: ExtractedFieldKey[] = ['vendorName', 'vendorTaxIdentifier', 'vendorEmail', 'invoiceNumber', 'invoiceDate', 'dueDate', 'currency', 'subtotal', 'taxAmount', 'totalAmount', 'purchaseOrderNumber', 'paymentTerms', 'bankAccountEnding', 'notes'];

function fieldInputType(field: ExtractedField) {
  if (field.key === 'invoiceDate' || field.key === 'dueDate') return 'date';
  if (field.key === 'subtotal' || field.key === 'taxAmount' || field.key === 'totalAmount') return 'number';
  if (field.key === 'vendorEmail') return 'email';
  return 'text';
}

function ExtractedFieldEditor({ invoiceId, field }: Readonly<{ invoiceId: string; field: ExtractedField }>) {
  const { getInvoice, updateField, reviewField, resetField } = useExtraction();
  const invoice = getInvoice(invoiceId);
  if (!invoice) return null;
  const fieldId = `field-${field.key}`;
  const issueId = `${fieldId}-issue`;
  return (
    <article className={`rounded-xl border p-4 ${field.edited ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label htmlFor={fieldId} className="text-sm font-semibold text-slate-950">{field.label}</label>
          <p className="mt-1 text-xs text-slate-500">{field.sourceHint}</p>
        </div>
        <ExtractionConfidenceBadge confidence={field.confidence} />
      </div>
      <input id={fieldId} type={fieldInputType(field)} value={field.value} onChange={(event) => updateField(invoice, field.key, event.target.value)} aria-describedby={field.validationIssue ? issueId : undefined} className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-600">Review status: {field.reviewStatus}{field.edited ? ' · edited' : ''}</span>
        <button type="button" onClick={() => reviewField(invoice, field.key, 'Accepted')} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700" aria-label={`Accept ${field.label}`}>Accept</button>
        <button type="button" onClick={() => reviewField(invoice, field.key, 'Rejected')} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700" aria-label={`Reject ${field.label}`}>Reject</button>
        <button type="button" onClick={() => resetField(invoice, field.key)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700" aria-label={`Reset ${field.label} to simulated value`}>Reset field</button>
      </div>
      {field.validationIssue && <p id={issueId} className="mt-2 text-sm text-red-700">{field.validationIssue}</p>}
    </article>
  );
}

export default function ExtractionDetailWorkspace({ invoiceId }: Readonly<{ invoiceId: string }>) {
  const { getInvoice, getResult, startExtraction, reprocessExtraction, resetExtraction } = useExtraction();
  const invoice = getInvoice(invoiceId);
  const result = getResult(invoiceId);
  const allInvoices = useExtraction().invoices;
  if (!invoice || !result) {
    return <section className="rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-semibold text-slate-950">Extraction result not found</h1><p className="mt-2 text-sm text-slate-600">This client-side intake record is not available in the current browser session.</p><Link href="/extraction" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Back to extraction queue</Link></section>;
  }
  const index = allInvoices.findIndex((item) => item.id === invoiceId);
  const previousInvoice = index > 0 ? allInvoices[index - 1] : undefined;
  const nextInvoice = index < allInvoices.length - 1 ? allInvoices[index + 1] : undefined;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Local extraction simulation</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Extraction Result</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Review deterministic structured fields for {invoice.invoiceNumber}. This screen does not run real OCR or AI.</p>
          </div>
          <div className="flex flex-wrap gap-2"><Link href="/extraction" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Back to queue</Link><Link href="/verification" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Continue to verification</Link></div>
        </div>
      </section>
      <ExtractionSessionNotice />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Document summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-medium text-slate-500">Invoice</dt><dd className="text-slate-950">{invoice.invoiceNumber}</dd></div>
              <div><dt className="font-medium text-slate-500">Vendor</dt><dd className="text-slate-950">{invoice.vendorName}</dd></div>
              <div><dt className="font-medium text-slate-500">File</dt><dd className="break-words text-slate-950">{invoice.fileName}</dd></div>
              <div><dt className="font-medium text-slate-500">Amount</dt><dd className="text-slate-950">{formatInvoiceCurrency(invoice.total, invoice.currency)}</dd></div>
              <div><dt className="font-medium text-slate-500">Source</dt><dd className="capitalize text-slate-950">{invoice.source.replace('-', ' ')}</dd></div>
            </dl>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Processing status</h2>
            <div className="mt-3 flex flex-wrap gap-2"><ExtractionStatusBadge status={result.status} /><ExtractionConfidenceBadge confidence={result.overallConfidence} /></div>
            <div className="mt-4"><ExtractionProgress stage={result.stage} progress={result.progress} /></div>
            <p className="mt-3 text-sm text-slate-600">Last processed: {result.lastProcessedAt ? formatInvoiceDate(result.lastProcessedAt) : 'Not processed yet'}</p>
            <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => startExtraction(invoice)} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700">Start Extraction</button><button type="button" onClick={() => reprocessExtraction(invoice)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Reprocess</button><button type="button" onClick={() => resetExtraction(invoice)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Reset Result</button></div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Activity history</h2>
            <ol className="mt-3 space-y-3 text-sm text-slate-700">
              {result.activity.map((entry) => <li key={entry.id} className="rounded-lg bg-slate-50 p-3"><p>{entry.message}</p><p className="mt-1 text-xs text-slate-500">{formatInvoiceDate(entry.at)}</p></li>)}
            </ol>
          </section>
        </aside>
        <main className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Validation issues</h2>
            {result.issues.length === 0 ? <p className="mt-2 text-sm text-slate-600">No validation issues currently require review.</p> : <ul className="mt-3 space-y-2">{result.issues.map((issue) => <li key={issue.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"><IssueSeverityBadge severity={issue.severity} /><span className="text-sm text-slate-700">{issue.message}</span></li>)}</ul>}
          </section>
          <section className="grid gap-4 lg:grid-cols-2" aria-label="Extracted field editor">
            {editableFieldKeys.map((key) => <ExtractedFieldEditor key={key} invoiceId={invoiceId} field={result.fields[key]} />)}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Line items</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[720px] w-full divide-y divide-slate-200 text-sm">
                <caption className="sr-only">Extracted line items with quantity, pricing, tax, total, and confidence</caption>
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2">Description</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2">Unit price</th><th className="px-3 py-2">Tax</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Confidence</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{result.lineItems.map((item) => <tr key={item.id}><td className="px-3 py-3 font-medium text-slate-900">{item.description}</td><td className="px-3 py-3">{item.quantity}</td><td className="px-3 py-3">{formatInvoiceCurrency(item.unitPrice, result.currency)}</td><td className="px-3 py-3">{formatInvoiceCurrency(item.tax, result.currency)}</td><td className="px-3 py-3">{formatInvoiceCurrency(item.total, result.currency)}</td><td className="px-3 py-3"><ExtractionConfidenceBadge confidence={item.confidence} /></td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <nav className="flex flex-col gap-2 sm:flex-row sm:justify-between" aria-label="Previous and next extraction results">
            {previousInvoice ? <Link href={`/extraction/${previousInvoice.id}`} className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700">Previous: {previousInvoice.invoiceNumber}</Link> : <span />}
            {nextInvoice && <Link href={`/extraction/${nextInvoice.id}`} className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700">Next: {nextInvoice.invoiceNumber}</Link>}
          </nav>
        </main>
      </div>
    </div>
  );
}
