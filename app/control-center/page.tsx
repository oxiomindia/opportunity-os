import Link from 'next/link';
import { requireControlCenterAccess } from '../../lib/control-center/auth';
import { getVisibleModules } from '../../lib/control-center/navigation';
import { getDashboardMetrics } from '../../lib/control-center/metrics';
import { listNotifications } from '../../lib/control-center/notifications';

const checkpoints = [
  { label: 'Phase 2a — Products, Pricing, Customers, Audit Logs, Notifications', done: true },
  { label: 'Phase 2b Checkpoint 1 — Trials', done: true },
  { label: 'Phase 2b Checkpoint 2 — Subscriptions', done: true },
  { label: 'Phase 2b Checkpoint 3 — Revenue', done: false },
];

export default async function ControlCenterDashboardPage() {
  // Owner-only: the shared layout now admits any platform admin role (so
  // /control-center/feedback works for all three), so this page -- like
  // every other Control Center page except Feedback -- enforces its own
  // Owner-only gate. Cached by React's cache(), so this re-reads the same
  // request-scoped result the layout already fetched, not a second query.
  const admin = await requireControlCenterAccess();
  const plannedModules = getVisibleModules(admin.role).filter((module) => module.availability === 'planned');
  const [metrics, notifications] = await Promise.all([getDashboardMetrics(), listNotifications()]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Welcome to the Oxiom Control Center</h1>
      <p className="mt-2 text-sm text-slate-600">
        Real counts from the platform database — no revenue or financial figures shown yet, since no payment data exists.
      </p>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Customers', value: metrics.totalCustomers },
          { label: 'Active trials', value: metrics.activeTrials },
          { label: 'Visible products', value: metrics.visibleProducts },
          { label: 'Audit entries (7d)', value: metrics.recentAuditActivity },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Subscriptions</h2>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Active', value: metrics.activeSubscriptions, tone: 'text-emerald-700' },
            { label: 'Expiring soon', value: metrics.expiringSoonSubscriptions, tone: 'text-amber-700' },
            { label: 'Suspended', value: metrics.suspendedSubscriptions, tone: 'text-amber-700' },
            { label: 'Cancelled', value: metrics.cancelledSubscriptions, tone: 'text-slate-500' },
          ].map((stat) => (
            <Link key={stat.label} href="/control-center/subscriptions" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300">
              <p className={`text-2xl font-semibold tracking-tight ${stat.tone}`}>{stat.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Recent conversions (Trial → Subscription)</h2>
        {metrics.recentConversions.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">No trial conversions yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {metrics.recentConversions.map((subscription) => (
              <li key={subscription.id}>
                <Link
                  href={`/control-center/subscriptions/${subscription.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm hover:bg-slate-50"
                >
                  <span>
                    <span className="font-semibold text-slate-800">{subscription.organizationName}</span>
                    <span className="ml-2 text-slate-500">{subscription.productSlug} — {subscription.planName}</span>
                  </span>
                  <span className="text-xs text-slate-400">{new Date(subscription.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Needs attention</h2>
        {notifications.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">Nothing needs attention right now.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <Link
                  href={`/control-center/customers/${notification.organizationId}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-sm hover:bg-slate-50"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${notification.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-semibold text-slate-800">{notification.title}</span>
                    <span className="ml-2 text-slate-500">{notification.detail}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Phase 2a checkpoint progress</h2>
        <ul className="mt-3 space-y-2">
          {checkpoints.map((checkpoint) => (
            <li key={checkpoint.label} className="flex items-start gap-2.5 text-sm">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  checkpoint.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}
                aria-hidden="true"
              >
                {checkpoint.done ? '✓' : ''}
              </span>
              <span className={checkpoint.done ? 'text-slate-800' : 'text-slate-500'}>{checkpoint.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Modules awaiting later checkpoints</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {plannedModules.map((module) => (
            <li key={module.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-700">{module.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{module.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
