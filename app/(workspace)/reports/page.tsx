import { listInvoices } from '../../../lib/invoices/repository';

export default async function ReportsPage() {
  const invoices = await listInvoices();
  const totalInvoices = invoices.length;
  const currencyCount = new Set(invoices.map((invoice) => invoice.currency)).size;
  const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid').length;
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue').length;
  const totalBilled = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const byStatus = Array.from(
    invoices.reduce((map, invoice) => map.set(invoice.status, (map.get(invoice.status) ?? 0) + 1), new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Reports</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Operational reporting</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Track invoice volume, payment progress, and status mix across your billing.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Invoices billed</p><p className="mt-2 text-3xl font-semibold text-slate-950">{totalInvoices}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Currencies represented</p><p className="mt-2 text-3xl font-semibold text-slate-950">{currencyCount}</p><p className="mt-1 text-xs text-slate-500">Values are never combined across currencies</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Paid rate</p><p className="mt-2 text-3xl font-semibold text-emerald-700">{totalInvoices ? Math.round((paidInvoices / totalInvoices) * 100) : 0}%</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Overdue rate</p><p className="mt-2 text-3xl font-semibold text-red-700">{totalInvoices ? Math.round((overdueInvoices / totalInvoices) * 100) : 0}%</p><p className="mt-1 text-xs text-slate-500">{formatTotal(totalBilled)} total billed</p></article>
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
      </section>
    </div>
  );
}

function formatTotal(total: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(total);
}
