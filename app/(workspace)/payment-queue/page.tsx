import Link from 'next/link';
import { listInvoices } from '../../../lib/invoices/repository';
import { formatInvoiceCurrency, formatInvoiceDate } from '../../../lib/invoiceFormatters';
import InvoiceStatusBadge from '../invoices/InvoiceStatusBadge';

export default async function PaymentQueuePage() {
  const invoices = await listInvoices();
  const payableStatuses = new Set(['approved', 'payment-ready', 'paid']);
  const paymentInvoices = invoices.filter((invoice) => payableStatuses.has(invoice.status));
  const readyInvoices = paymentInvoices.filter((invoice) => invoice.status === 'payment-ready');
  const approvedInvoices = paymentInvoices.filter((invoice) => invoice.status === 'approved');
  const paidInvoices = paymentInvoices.filter((invoice) => invoice.status === 'paid');
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Payment queue</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Payment operations hub</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Batch approved invoices, confirm payment readiness, and monitor completed disbursements without losing invoice traceability.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Approved</p><p className="mt-2 text-3xl font-semibold text-slate-950">{approvedInvoices.length}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Payment-ready</p><p className="mt-2 text-3xl font-semibold text-blue-700">{readyInvoices.length}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Paid</p><p className="mt-2 text-3xl font-semibold text-emerald-700">{paidInvoices.length}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Currencies represented</p><p className="mt-2 text-3xl font-semibold text-slate-950">{new Set(paymentInvoices.map((invoice) => invoice.currency)).size}</p><p className="mt-1 text-xs text-slate-500">Payment values remain currency-specific</p></article>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Payment candidates</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {paymentInvoices.map((invoice) => (
            <article key={invoice.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-center">
              <div>
                <Link href={`/invoices/${invoice.id}`} className="font-semibold text-slate-950 hover:text-blue-700 hover:underline">{invoice.invoiceNumber}</Link>
                <p className="mt-1 text-sm text-slate-500">{invoice.vendorName}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">{formatInvoiceCurrency(invoice.total, invoice.currency)}</p>
              <p className="text-sm text-slate-600">Due {formatInvoiceDate(invoice.dueDate)}</p>
              <p className="text-sm text-slate-600">Owner: {invoice.assignedTo ?? 'Treasury'}</p>
              <InvoiceStatusBadge status={invoice.status} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
