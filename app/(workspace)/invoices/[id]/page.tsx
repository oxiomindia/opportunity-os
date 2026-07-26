import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInvoice, getInvoiceDocument } from '../../../../lib/invoices/repository';
import { formatInvoiceCurrency, formatInvoiceDate } from '../../../../lib/invoiceFormatters';
import InvoiceStatusBadge from '../InvoiceStatusBadge';
import { archiveInvoice, deleteInvoice } from '../actions';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: Readonly<InvoiceDetailPageProps>) {
  const { id } = await params;
  const [invoice, document] = await Promise.all([getInvoice(id), getInvoiceDocument(id)]);

  if (!invoice) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/invoices" className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline">
        ← Back to invoices
      </Link>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Invoice detail</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{invoice.invoiceNumber}</h1>
            <p className="mt-2 text-sm text-slate-600">{invoice.fileName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2"><InvoiceStatusBadge status={invoice.status} /><form action={archiveInvoice}><input type="hidden" name="id" value={invoice.id} /><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Archive</button></form><form action={deleteInvoice}><input type="hidden" name="id" value={invoice.id} /><button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Delete</button></form></div>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Vendor</p>
          <p className="mt-2 text-base font-semibold text-slate-950">{invoice.vendorName}</p>
          <p className="mt-1 text-sm text-slate-500">{invoice.vendorEmail ?? 'No vendor email'}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Amount</p>
          <p className="mt-2 text-base font-semibold text-slate-950">{formatInvoiceCurrency(invoice.total, invoice.currency)}</p>
          <p className="mt-1 text-sm text-slate-500">Subtotal plus tax</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Status</p>
          <div className="mt-2"><InvoiceStatusBadge status={invoice.status} /></div>
          <p className="mt-3 text-sm text-slate-500">{invoice.exceptionCount} {invoice.exceptionCount === 1 ? 'exception' : 'exceptions'}</p>
        </article>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Verification record</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Invoice date</dt><dd className="mt-1 text-sm font-semibold text-slate-950">{formatInvoiceDate(invoice.invoiceDate)}</dd></div>
            <div className="rounded-lg bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due date</dt><dd className="mt-1 text-sm font-semibold text-slate-950">{formatInvoiceDate(invoice.dueDate)}</dd></div>
            <div className="rounded-lg bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subtotal</dt><dd className="mt-1 text-sm font-semibold text-slate-950">{formatInvoiceCurrency(invoice.subtotal, invoice.currency)}</dd></div>
            <div className="rounded-lg bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tax</dt><dd className="mt-1 text-sm font-semibold text-slate-950">{formatInvoiceCurrency(invoice.tax, invoice.currency)}</dd></div>
            <div className="rounded-lg bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</dt><dd className="mt-1 text-sm font-semibold capitalize text-slate-950">{invoice.source.replace('-', ' ')}</dd></div>
            <div className="rounded-lg bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned owner</dt><dd className="mt-1 text-sm font-semibold text-slate-950">{invoice.assignedTo ?? 'Unassigned'}</dd></div>
          </dl>
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Automation confidence</h2>
          <p className="mt-4 text-4xl font-semibold text-blue-700">{invoice.confidence}%</p>
          <div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${invoice.confidence}%` }} /></div>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
            <li>File: {invoice.fileName}</li>
            <li>Type: {invoice.fileType.toUpperCase()}</li>
            <li>Received: {formatInvoiceDate(invoice.receivedAt)}</li>
          </ul>
        </aside>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4"><h2 className="text-base font-semibold text-slate-950">Source document</h2>{document && <a href={document.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 hover:underline">Open securely</a>}</div>
        {!document ? <p className="mt-4 text-sm text-slate-500">No stored document is available for this invoice.</p> : document.mimeType === 'application/pdf' ? <iframe src={document.url} title={document.name} className="mt-4 h-[42rem] w-full rounded-lg border border-slate-200" /> : <DocumentImage url={document.url} name={document.name} />}
      </section>
    </div>
  );
}

function DocumentImage({ url, name }: Readonly<{ url: string; name: string }>) {
  // Signed storage URLs expire quickly and do not have stable dimensions for next/image optimization.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={`Source invoice ${name}`} className="mt-4 max-h-[42rem] w-full rounded-lg border border-slate-200 object-contain" />;
}
