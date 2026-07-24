import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockInvoices } from '../../../../data/mockInvoices';
import { formatInvoiceCurrency } from '../../../../lib/invoiceFormatters';
import InvoiceStatusBadge from '../InvoiceStatusBadge';
import { getInvoiceById } from '../invoiceWorklistUtils';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: Readonly<InvoiceDetailPageProps>) {
  const { id } = await params;
  const invoice = getInvoiceById(mockInvoices, id);

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
          <InvoiceStatusBadge status={invoice.status} />
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
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <h2 className="text-base font-semibold text-slate-950">Detailed verification view will be implemented in a later module</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          This placeholder confirms row navigation and invoice identity only. No approval mutation, OCR, AI extraction, or backend persistence is available in Module 2.
        </p>
      </section>
    </div>
  );
}
