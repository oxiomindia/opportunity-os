import { listInvoices } from '../../../lib/invoices/repository';
import { listVendorInvoices } from '../../../lib/vendorInvoices/repository';
import { getCurrentEdition } from '../../../lib/edition';

export default async function ReportsPage() {
  const edition = await getCurrentEdition();
  const showAr = edition === 'ar' || edition === 'finance_suite';
  const showAp = edition === 'ap' || edition === 'finance_suite';
  const [invoices, bills] = await Promise.all([showAr ? listInvoices() : Promise.resolve([]), showAp ? listVendorInvoices() : Promise.resolve([])]);

  const totalInvoices = invoices.length;
  const currencyCount = new Set(invoices.map((invoice) => invoice.currency)).size;
  const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid').length;
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue').length;
  const totalBilled = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const invoicesByStatus = Array.from(
    invoices.reduce((map, invoice) => map.set(invoice.status, (map.get(invoice.status) ?? 0) + 1), new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  const totalBills = bills.length;
  const billCurrencyCount = new Set(bills.map((bill) => bill.currency)).size;
  const paidBills = bills.filter((bill) => bill.status === 'paid').length;
  const today = new Date().toISOString().slice(0, 10);
  const awaitingPaymentStatuses = new Set(['approved', 'payment-scheduled', 'partially-paid']);
  const overdueBills = bills.filter((bill) => awaitingPaymentStatuses.has(bill.status) && bill.dueDate < today).length;
  const totalOwed = bills.reduce((sum, bill) => sum + bill.total, 0);
  const billsByStatus = Array.from(
    bills.reduce((map, bill) => map.set(bill.status, (map.get(bill.status) ?? 0) + 1), new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Reports</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Operational reporting</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Track invoice volume, payment progress, and status mix across billing (AR) and vendor bills (AP).
        </p>
      </section>

      {showAr && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Customer invoices</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Invoices billed</p><p className="mt-2 text-3xl font-semibold text-slate-950">{totalInvoices}</p></article>
            <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Currencies represented</p><p className="mt-2 text-3xl font-semibold text-slate-950">{currencyCount}</p><p className="mt-1 text-xs text-slate-500">Values are never combined across currencies</p></article>
            <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Paid rate</p><p className="mt-2 text-3xl font-semibold text-emerald-700">{totalInvoices ? Math.round((paidInvoices / totalInvoices) * 100) : 0}%</p></article>
            <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Overdue rate</p><p className="mt-2 text-3xl font-semibold text-red-700">{totalInvoices ? Math.round((overdueInvoices / totalInvoices) * 100) : 0}%</p><p className="mt-1 text-xs text-slate-500">{formatTotal(totalBilled)} total billed</p></article>
          </div>
          <article className="mt-3 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-950">Invoice status distribution</h3>
            <div className="mt-5 space-y-4">
              {invoicesByStatus.map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm"><span className="font-medium capitalize text-slate-700">{status.replace('-', ' ')}</span><span className="text-slate-500">{count}</span></div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${(count / totalInvoices) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {showAp && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Vendor bills</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Bills recorded</p><p className="mt-2 text-3xl font-semibold text-slate-950">{totalBills}</p></article>
            <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Currencies represented</p><p className="mt-2 text-3xl font-semibold text-slate-950">{billCurrencyCount}</p><p className="mt-1 text-xs text-slate-500">Values are never combined across currencies</p></article>
            <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Paid rate</p><p className="mt-2 text-3xl font-semibold text-emerald-700">{totalBills ? Math.round((paidBills / totalBills) * 100) : 0}%</p></article>
            <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">Overdue rate</p><p className="mt-2 text-3xl font-semibold text-red-700">{totalBills ? Math.round((overdueBills / totalBills) * 100) : 0}%</p><p className="mt-1 text-xs text-slate-500">{formatTotal(totalOwed)} total owed</p></article>
          </div>
          <article className="mt-3 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-950">Bill status distribution</h3>
            <div className="mt-5 space-y-4">
              {billsByStatus.map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm"><span className="font-medium capitalize text-slate-700">{status.replace('-', ' ')}</span><span className="text-slate-500">{count}</span></div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-amber-600" style={{ width: `${(count / totalBills) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

function formatTotal(total: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(total);
}
