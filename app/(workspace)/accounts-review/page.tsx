import Link from 'next/link';
import { listInvoices } from '../../../lib/invoices/repository';
import { formatInvoiceDate } from '../../../lib/invoiceFormatters';
import InvoiceStatusBadge from '../invoices/InvoiceStatusBadge';

export default async function AccountsReviewPage() {
  const invoices = await listInvoices();
  const reviewInvoices = invoices.filter((invoice) => invoice.status === 'accounts-review' || invoice.exceptionCount > 0);
  const criticalInvoices = reviewInvoices.filter((invoice) => invoice.exceptionCount >= 4);
  const assignedOwners = Array.from(new Set(reviewInvoices.map((invoice) => invoice.assignedTo ?? 'Unassigned')));

  const exceptionPolicies = [
    'Validate tax registration, GST/VAT totals, and purchase order references.',
    'Confirm vendor bank details before releasing invoices to payment operations.',
    'Escalate invoices with four or more exceptions to the controller queue.',
  ];
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Accounts review</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Accounting exception center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Resolve coding issues, policy exceptions, missing documentation, and vendor-accounting mismatches before payment approval.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Review workload</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{reviewInvoices.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Critical exceptions</p>
          <p className="mt-2 text-3xl font-semibold text-red-700">{criticalInvoices.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Review owners</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{assignedOwners.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Currencies represented</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{new Set(reviewInvoices.map((invoice) => invoice.currency)).size}</p>
          <p className="mt-1 text-xs text-slate-500">Exposure is not combined across currencies</p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">Exception worklist</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {reviewInvoices.map((invoice) => (
              <article key={invoice.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-center">
                <div>
                  <Link href={`/invoices/${invoice.id}`} className="font-semibold text-slate-950 hover:text-blue-700 hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">{invoice.vendorName}</p>
                </div>
                <p className="text-sm text-slate-600">Owner: {invoice.assignedTo ?? 'Unassigned'}</p>
                <p className="text-sm text-slate-600">Due {formatInvoiceDate(invoice.dueDate)}</p>
                <div className="flex items-center gap-3 lg:justify-end">
                  <InvoiceStatusBadge status={invoice.status} />
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {invoice.exceptionCount} exceptions
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Review policy checklist</h2>
          <ul className="mt-4 space-y-3">
            {exceptionPolicies.map((policy) => (
              <li key={policy} className="flex gap-3 text-sm leading-6 text-slate-600">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">✓</span>
                {policy}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
