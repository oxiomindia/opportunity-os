import Link from 'next/link';
import { getControlCenterAdmin } from '../../lib/control-center/auth';
import { getVisibleModules } from '../../lib/control-center/navigation';
import { getDashboardMetrics } from '../../lib/control-center/metrics';
import { listNotifications } from '../../lib/control-center/notifications';

const checkpoints = [
  { label: 'Foundation — shell, navigation, authentication, authorization', done: true },
  { label: 'Database — schema, migrations, RLS policies', done: true },
  { label: 'Products & Pricing modules', done: true },
  { label: 'Customers module', done: true },
  { label: 'Audit Logs & Notifications', done: true },
  { label: 'Testing & verification', done: false },
];

export default async function ControlCenterDashboardPage() {
  // Cached by React's cache() — this re-reads the same request-scoped result
  // the layout already fetched, not a second database round trip.
  const admin = await getControlCenterAdmin();
  const plannedModules = admin ? getVisibleModules(admin.role).filter((module) => module.availability === 'planned') : [];
  const [metrics, notifications] = await Promise.all([getDashboardMetrics(), listNotifications()]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Welcome to the Oxiom Control Center</h1>
      <p className="mt-2 text-sm text-slate-600">
        Real counts from the platform database — no revenue or financial figures shown yet, since no payment data exists.
      </p>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Customers', value: metrics.totalCustomers },
          { label: 'Active trials', value: metrics.activeTrials },
          { label: 'Active subscriptions', value: metrics.activeSubscriptions },
          { label: 'Visible products', value: metrics.visibleProducts },
          { label: 'Audit entries (7d)', value: metrics.recentAuditActivity },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
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
