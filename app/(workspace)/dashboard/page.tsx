import Link from 'next/link';
import { listInvoices } from '../../../lib/invoices/repository';
import { formatInvoiceCurrency, formatInvoiceDate } from '../../../lib/invoiceFormatters';
import InvoiceStatusBadge from '../invoices/InvoiceStatusBadge';
import { getSessionContext } from '../../../lib/auth/dal';

export default async function DashboardPage() {
  const session = await getSessionContext();
  if (!session) {
    return <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Welcome to Oxiom</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Your workspace is ready</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Explore the application now. Create an organization when you are ready to add invoices and use organization-specific workflows.</p>
        <Link href="/onboarding" className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Create Organization</Link>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Explore Oxiom</h2><p className="mt-2 text-sm leading-6 text-slate-600">Review product documentation, security information, and workflow capabilities without completing organization setup.</p><Link href="/docs" className="mt-4 inline-flex text-sm font-semibold text-blue-700">Browse documentation →</Link></article>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-semibold text-amber-950">Organization features</h2><p className="mt-2 text-sm leading-6 text-amber-900">An organization is required before creating invoices, viewing reports, or configuring organization settings.</p><Link href="/onboarding" className="mt-4 inline-flex text-sm font-semibold text-amber-950 underline">Set up an organization</Link></article>
      </section>
    </div>;
  }
  const invoices = await listInvoices();
  const draft = invoices.filter((invoice) => invoice.status === 'draft').length;
  const outstanding = invoices.filter((invoice) => ['sent', 'viewed', 'partially-paid', 'overdue'].includes(invoice.status)).length;
  const overdue = invoices.filter((invoice) => invoice.status === 'overdue').length;
  const monthly = new Map<string, number>();
  invoices.forEach((invoice) => { const month = invoice.createdAt.slice(0, 7); monthly.set(month, (monthly.get(month) ?? 0) + 1); });
  const trends = Array.from(monthly.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxTrend = Math.max(...trends.map(([, count]) => count), 1);

  return <div className="flex flex-col gap-5">
    <section className="rounded-xl border border-slate-200 bg-white p-5"><h1 className="text-2xl font-semibold text-slate-950">Billing overview</h1><p className="mt-2 text-sm text-slate-600">Live metrics from your organization&apos;s invoices.</p></section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[['Total invoices', invoices.length], ['Draft', draft], ['Outstanding', outstanding], ['Overdue', overdue]].map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p></article>)}
    </section>
    <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <article className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Monthly invoices created</h2>{trends.length ? <div className="mt-6 flex h-44 items-end gap-3">{trends.map(([month, count]) => <div key={month} className="flex flex-1 flex-col items-center gap-2"><span className="text-xs font-semibold text-slate-600">{count}</span><div className="w-full rounded-t bg-blue-500" style={{ height: `${Math.max(8, count / maxTrend * 120)}px` }} /><span className="text-[11px] text-slate-500">{month}</span></div>)}</div> : <p className="mt-6 text-sm text-slate-500">No invoice activity yet.</p>}</article>
      <article className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Quick actions</h2><div className="mt-5 flex flex-col gap-3"><Link href="/invoices/new" className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700">New invoice</Link><Link href="/customers" className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700">Manage customers</Link></div></article>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-950">Recent invoices</h2><Link href="/invoices" className="text-sm font-semibold text-blue-700">View all</Link></div>{invoices.length ? <div className="mt-4 divide-y divide-slate-100">{invoices.slice(0, 5).map((invoice) => <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-slate-50"><div><p className="text-sm font-semibold text-slate-900">{invoice.invoiceNumber}</p><p className="text-xs text-slate-500">{invoice.customerName} · {formatInvoiceDate(invoice.createdAt)}</p></div><div className="flex items-center gap-3"><span className="text-sm font-semibold">{formatInvoiceCurrency(invoice.total, invoice.currency)}</span><InvoiceStatusBadge status={invoice.status} /></div></Link>)}</div> : <p className="mt-4 text-sm text-slate-500">Create your first invoice to begin.</p>}</section>
  </div>;
}
