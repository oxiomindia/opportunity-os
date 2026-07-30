import Link from 'next/link';
import { getItcReconciliationReport, rowPeriod } from '../../../lib/itcRecovery/report';
import { formatItcCurrency, formatItcDate } from '../../../lib/itcRecoveryFormatters';
import ItcStatusBadge from './ItcStatusBadge';
import { deleteItcReturnRecord } from './actions';
import type { ItcReconciliationReport } from '../../../lib/itcRecovery/report';

export const metadata = {
  title: 'ITC Recovery | Oxiom',
  description: 'Reconcile Input Tax Credit against your purchase records and filed GST returns.',
};

export default async function ItcRecoveryPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ period?: string; error?: string; imported?: string }> }>) {
  const { period, error, imported } = await searchParams;

  let report: ItcReconciliationReport | null = null;
  let loadError: string | null = null;
  try {
    report = await getItcReconciliationReport(period);
  } catch {
    loadError = 'Unable to load reconciliation data right now. Please try again shortly.';
  }

  const exportQuery = period ? `?period=${encodeURIComponent(period)}` : '';

  const sortedRows = [...(report?.rows ?? [])].sort((a, b) => {
    const order = { mismatch: 0, 'missing-in-return': 1, 'return-record-only': 2, matched: 3 } as const;
    return order[a.status] - order[b.status];
  });

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">ITC Recovery</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Input Tax Credit Reconciliation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Matches your purchase invoices against filed GST return records by vendor GSTIN and invoice number.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {report && (
              <>
                <a href={`/api/itc-recovery/export/csv${exportQuery}`} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700">
                  Export CSV
                </a>
                <a href={`/api/itc-recovery/export/pdf${exportQuery}`} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700">
                  Download PDF
                </a>
              </>
            )}
            <Link href="/itc-recovery/import" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700">
              Import CSV
            </Link>
            <Link href="/itc-recovery/new" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Add return record
            </Link>
          </div>
        </div>
      </section>

      {imported === '1' && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Return records imported successfully.</div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error === 'mutation' ? 'Something went wrong saving that record.' : error === 'demo-read-only' ? 'This action is not available in demo mode.' : 'That request was invalid.'}
        </div>
      )}
      {loadError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>}

      {report && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Total purchase tax', value: formatItcCurrency(report.summary.totalPurchaseTax), tone: 'bg-blue-50 text-blue-700' },
              { label: 'Total return tax', value: formatItcCurrency(report.summary.totalReturnTax), tone: 'bg-slate-100 text-slate-700' },
              { label: 'Recoverable ITC', value: formatItcCurrency(report.summary.recoverableItc), tone: 'bg-emerald-50 text-emerald-700' },
              { label: 'At-risk ITC', value: formatItcCurrency(report.summary.atRiskItc), tone: 'bg-red-50 text-red-700' },
              { label: 'Reconciliation %', value: `${report.summary.reconciliationPercentage}%`, tone: 'bg-violet-50 text-violet-700' },
            ].map((card) => (
              <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{card.value}</p>
                <span className={`mt-3 inline-flex h-1.5 w-8 rounded-full ${card.tone}`} aria-hidden="true" />
              </article>
            ))}
          </section>

          {report.periods.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-slate-600">Return period:</span>
              <Link href="/itc-recovery" className={`rounded-full border px-3 py-1 ${!period ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                All
              </Link>
              {report.periods.map((value) => (
                <Link
                  key={value}
                  href={`/itc-recovery?period=${value}`}
                  className={`rounded-full border px-3 py-1 ${period === value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                >
                  {value}
                </Link>
              ))}
            </div>
          )}

          <section className="rounded-xl border border-slate-200 bg-white">
            {sortedRows.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No reconciliation data yet.{' '}
                <Link href="/itc-recovery/new" className="font-semibold text-blue-700 hover:underline">Add a return record</Link>{' '}
                or{' '}
                <Link href="/itc-recovery/import" className="font-semibold text-blue-700 hover:underline">import a CSV</Link>{' '}
                to get started. Purchase invoices with tax already recorded in Bills are matched automatically.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="p-4">Status</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Invoice</th>
                      <th className="p-4">Purchase tax</th>
                      <th className="p-4">Return tax</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row, index) => {
                      const record = row.purchaseRecord ?? row.returnRecord!;
                      const vendorName = row.purchaseRecord?.vendorName ?? row.returnRecord?.vendorName;
                      const invoiceNumber = row.purchaseRecord?.invoiceNumber ?? row.returnRecord?.returnInvoiceNumber;
                      return (
                        <tr key={`${row.status}-${index}`} className="border-b border-slate-50 last:border-0">
                          <td className="p-4"><ItcStatusBadge status={row.status} /></td>
                          <td className="p-4">
                            <p className="font-medium text-slate-900">{vendorName}</p>
                            <p className="text-xs text-slate-400">{'invoiceDate' in record && record.invoiceDate ? formatItcDate(record.invoiceDate) : rowPeriod(row)}</p>
                          </td>
                          <td className="p-4 text-slate-700">{invoiceNumber}</td>
                          <td className="p-4 text-slate-700">{row.purchaseRecord ? formatItcCurrency(row.purchaseRecord.taxAmount, row.purchaseRecord.currency) : '—'}</td>
                          <td className="p-4 text-slate-700">{row.returnRecord ? formatItcCurrency(row.returnRecord.taxAmount, row.returnRecord.currency) : '—'}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {row.purchaseRecord && (
                                <Link href={`/bills/${row.purchaseRecord.vendorInvoiceId}`} className="text-xs font-semibold text-blue-700 hover:underline">
                                  View bill →
                                </Link>
                              )}
                              {row.returnRecord && (
                                <form action={deleteItcReturnRecord}>
                                  <input type="hidden" name="recordId" value={row.returnRecord.id} />
                                  <button type="submit" className="text-xs font-semibold text-slate-400 hover:text-red-600">
                                    Remove
                                  </button>
                                </form>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
