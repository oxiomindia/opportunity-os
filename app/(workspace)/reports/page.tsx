import { mockInvoices } from '../../../data/mockInvoices';
import { formatInvoiceCurrency } from '../../../lib/invoiceFormatters';

const totalInvoices = mockInvoices.length;
const totalValue = mockInvoices.reduce((total, invoice) => total + invoice.total, 0);
const exceptionInvoices = mockInvoices.filter((invoice) => invoice.exceptionCount > 0).length;
const paidInvoices = mockInvoices.filter((invoice) => invoice.status === 'paid').length;
const byStatus = Array.from(
  mockInvoices.reduce((map, invoice) => map.set(invoice.status, (map.get(invoice.status) ?? 0) + 1), new Map<string, number>()),
).sort((a, b) => b[1] - a[1]);
const bySource = Array.from(
  mockInvoices.reduce((map, invoice) => map.set(invoice.source, (map.get(invoice.source) ?? 0) + 1), new Map<string, number>()),
).sort((a, b) => b[1] - a[1]);
const averageConfidence = Math.round(mockInvoices.reduce((total, invoice) => total + invoice.confidence, 0) / totalInvoices);

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Reports</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Operational reporting</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Track invoice throughput, exception density, automation confidence, and payment progress across the Oxiom workflow.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Invoices processed</p><p className="mt-2 text-3xl font-semibold text-slate-950">{totalInvoices}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Gross invoice value</p><p className="mt-2 text-3xl font-semibold text-slate-950">{formatInvoiceCurrency(totalValue, 'USD')}</p><p className="mt-1 text-xs text-slate-500">Mixed-currency operational estimate</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Average confidence</p><p className="mt-2 text-3xl font-semibold text-blue-700">{averageConfidence}%</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Exception rate</p><p className="mt-2 text-3xl font-semibold text-amber-700">{Math.round((exceptionInvoices / totalInvoices) * 100)}%</p><p className="mt-1 text-xs text-slate-500">{paidInvoices} invoices paid</p></article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Status distribution</h2>
          <div className="mt-5 space-y-4">
            {byStatus.map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm"><span className="font-medium capitalize text-slate-700">{status.replace('-', ' ')}</span><span className="text-slate-500">{count}</span></div>
                <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${(count / totalInvoices) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Intake source mix</h2>
          <div className="mt-5 space-y-4">
            {bySource.map(([source, count]) => (
              <div key={source}>
                <div className="flex justify-between text-sm"><span className="font-medium capitalize text-slate-700">{source.replace('-', ' ')}</span><span className="text-slate-500">{count}</span></div>
                <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-600" style={{ width: `${(count / totalInvoices) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
