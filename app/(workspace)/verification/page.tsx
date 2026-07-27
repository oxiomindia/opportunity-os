import Link from 'next/link';
import { listInvoices } from '../../../lib/invoices/repository';
import { formatInvoiceCurrency, formatInvoiceDate } from '../../../lib/invoiceFormatters';
import InvoiceStatusBadge from '../invoices/InvoiceStatusBadge';

export default async function VerificationPage() {
  const invoices = await listInvoices();
  const verificationStatuses = new Set(['received', 'processing', 'needs-review', 'verified']);
  const verificationQueue = invoices.filter((invoice) => verificationStatuses.has(invoice.status));
  const readyCount = verificationQueue.filter((invoice) => invoice.status === 'verified').length;
  const exceptionCount = verificationQueue.reduce((total, invoice) => total + invoice.exceptionCount, 0);
  const averageConfidence = verificationQueue.length
    ? Math.round(verificationQueue.reduce((total, invoice) => total + invoice.confidence, 0) / verificationQueue.length)
    : null;
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Verification</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Invoice verification queue</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Validate extracted invoice fields, triage low-confidence captures, and prepare clean records for accounts review.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Open verification items</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{verificationQueue.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Ready to advance</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">{readyCount}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Extraction confidence</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{averageConfidence === null ? 'Not available' : `${averageConfidence}%`}</p>
          <p className="mt-1 text-sm text-slate-500">{exceptionCount} exceptions detected</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Documents awaiting verification</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {verificationQueue.map((invoice) => (
            <article key={invoice.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-center">
              <div>
                <Link href={`/invoices/${invoice.id}`} className="font-semibold text-slate-950 hover:text-blue-700 hover:underline">
                  {invoice.invoiceNumber}
                </Link>
                <p className="mt-1 text-sm text-slate-500">{invoice.vendorName}</p>
              </div>
              <div className="text-sm text-slate-600">
                <p>Due {formatInvoiceDate(invoice.dueDate)}</p>
                <p>{formatInvoiceCurrency(invoice.total, invoice.currency)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Confidence {invoice.confidence}%</p>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${invoice.confidence}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3 lg:justify-end">
                <InvoiceStatusBadge status={invoice.status} />
                <span className="text-sm text-slate-500">{invoice.exceptionCount} exceptions</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
