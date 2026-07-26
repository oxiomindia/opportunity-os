import Link from 'next/link';
import { listInvoices } from '../../../lib/invoices/repository';
import { formatInvoiceCurrency, formatInvoiceDate } from '../../../lib/invoiceFormatters';
import InvoiceStatusBadge from '../invoices/InvoiceStatusBadge';

export default async function DashboardPage() {
  const invoices = await listInvoices();
  const pending = invoices.filter((invoice) => ['received', 'processing', 'needs-review', 'accounts-review'].includes(invoice.status)).length;
  const processed = invoices.filter((invoice) => ['verified', 'approved', 'payment-ready', 'paid'].includes(invoice.status)).length;
  const rejected = invoices.filter((invoice) => invoice.status === 'rejected').length;
  const reviewed = invoices.filter((invoice) => invoice.confidence > 0);
  const averageConfidence = reviewed.length ? Math.round(reviewed.reduce((sum, invoice) => sum + invoice.confidence, 0) / reviewed.length) : null;
  const monthly = new Map<string, number>();
  invoices.forEach((invoice) => { const month = invoice.receivedAt.slice(0, 7); monthly.set(month, (monthly.get(month) ?? 0) + 1); });
  const trends = Array.from(monthly.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxTrend = Math.max(...trends.map(([, count]) => count), 1);

  return <div className="flex flex-col gap-5">
    <section className="rounded-xl border border-slate-200 bg-white p-5"><h1 className="text-2xl font-semibold text-slate-950">Invoice operations</h1><p className="mt-2 text-sm text-slate-600">Live metrics from your organization&apos;s invoice records.</p></section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[['Total invoices', invoices.length], ['Pending', pending], ['Processed', processed], ['Rejected', rejected]].map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p></article>)}
    </section>
    <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <article className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Monthly intake</h2>{trends.length ? <div className="mt-6 flex h-44 items-end gap-3">{trends.map(([month, count]) => <div key={month} className="flex flex-1 flex-col items-center gap-2"><span className="text-xs font-semibold text-slate-600">{count}</span><div className="w-full rounded-t bg-blue-500" style={{ height: `${Math.max(8, count / maxTrend * 120)}px` }} /><span className="text-[11px] text-slate-500">{month}</span></div>)}</div> : <p className="mt-6 text-sm text-slate-500">No invoice activity yet.</p>}</article>
      <article className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Processing statistics</h2><dl className="mt-5 space-y-4"><div><dt className="text-sm text-slate-500">Extraction reviewed</dt><dd className="mt-1 text-xl font-semibold">{reviewed.length}</dd></div><div><dt className="text-sm text-slate-500">Average confidence</dt><dd className="mt-1 text-xl font-semibold">{averageConfidence === null ? 'Not available' : `${averageConfidence}%`}</dd></div></dl></article>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-950">Recent invoices</h2><Link href="/invoices" className="text-sm font-semibold text-blue-700">View all</Link></div>{invoices.length ? <div className="mt-4 divide-y divide-slate-100">{invoices.slice(0, 5).map((invoice) => <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-slate-50"><div><p className="text-sm font-semibold text-slate-900">{invoice.invoiceNumber}</p><p className="text-xs text-slate-500">{invoice.vendorName} · {formatInvoiceDate(invoice.receivedAt)}</p></div><div className="flex items-center gap-3"><span className="text-sm font-semibold">{formatInvoiceCurrency(invoice.total, invoice.currency)}</span><InvoiceStatusBadge status={invoice.status} /></div></Link>)}</div> : <p className="mt-4 text-sm text-slate-500">Upload an invoice to begin.</p>}</section>
  </div>;
}
