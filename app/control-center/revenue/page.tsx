import { getRevenueDashboard } from '../../../lib/control-center/revenue';

function formatPaise(paise: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(paise / 100);
}

function ProjectedBadge() {
  return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">Projected</span>;
}

export default async function ControlCenterRevenuePage() {
  const { summary, byProduct, byPlan, trialConversion, renewalForecast, growth } = await getRevenueDashboard();
  const maxGrowth = Math.max(1, ...growth.map((g) => g.newSubscriptions));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Revenue</h1>
      <p className="mt-2 text-sm text-slate-600">
        Computed entirely from active subscriptions and their Commercial Plan prices — nothing here is entered manually.
      </p>
      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <strong className="font-semibold">Projected Revenue.</strong> There is no payment or invoice record in this codebase yet, so every figure
        below reflects subscription commitments, not confirmed money received.
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2"><p className="text-2xl font-semibold tracking-tight text-slate-950">{formatPaise(summary.mrrPaise, summary.currency)}</p></div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">MRR <ProjectedBadge /></p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{formatPaise(summary.arrPaise, summary.currency)}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">ARR <ProjectedBadge /></p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{summary.activeCustomers}</p>
          <p className="mt-0.5 text-xs text-slate-500">Active customers</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{summary.activeSubscriptions}</p>
          <p className="mt-0.5 text-xs text-slate-500">Active subscriptions</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{trialConversion.ratePercent}%</p>
          <p className="mt-0.5 text-xs text-slate-500">Trial conversion ({trialConversion.converted}/{trialConversion.terminalTotal} decided)</p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">Revenue by product <ProjectedBadge /></h2>
          {byProduct.length === 0 ? (
            <p className="mt-3 text-xs text-slate-400">No active subscriptions yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {byProduct.map((row) => (
                <li key={row.key} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{row.label} <span className="text-xs text-slate-400">({row.subscriptionCount})</span></span>
                  <span className="font-semibold text-slate-900">{formatPaise(row.mrrPaise, row.currency)}/mo</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">Revenue by commercial plan <ProjectedBadge /></h2>
          {byPlan.length === 0 ? (
            <p className="mt-3 text-xs text-slate-400">No active subscriptions yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {byPlan.map((row) => (
                <li key={row.key} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{row.label} <span className="text-xs text-slate-400">({row.subscriptionCount})</span></span>
                  <span className="font-semibold text-slate-900">{formatPaise(row.mrrPaise, row.currency)}/mo</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">Renewal forecast <ProjectedBadge /></h2>
          <ul className="mt-4 space-y-2">
            {renewalForecast.map((bucket) => (
              <li key={bucket.label} className="flex items-center justify-between text-sm">
                <span className={bucket.label === 'Overdue' ? 'text-rose-700' : 'text-slate-700'}>
                  {bucket.label} <span className="text-xs text-slate-400">({bucket.subscriptionCount})</span>
                </span>
                <span className="font-semibold text-slate-900">{formatPaise(bucket.projectedPaise, bucket.currency)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Subscription growth (new, last 6 months)</h2>
          <ul className="mt-4 space-y-2">
            {growth.map((point) => (
              <li key={point.monthLabel} className="flex items-center gap-3 text-sm">
                <span className="w-12 shrink-0 text-xs text-slate-500">{point.monthLabel}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-blue-600"
                    style={{ width: `${(point.newSubscriptions / maxGrowth) * 100}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-700">{point.newSubscriptions}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
