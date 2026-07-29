import { getControlCenterAdmin } from '../../lib/control-center/auth';
import { getVisibleModules } from '../../lib/control-center/navigation';

const checkpoints = [
  { label: 'Foundation — shell, navigation, authentication, authorization', done: true },
  { label: 'Database — schema, migrations, RLS policies', done: false },
  { label: 'Products & Pricing modules', done: false },
  { label: 'Customers module', done: false },
  { label: 'Audit Logs & Notifications', done: false },
  { label: 'Testing & verification', done: false },
];

export default async function ControlCenterDashboardPage() {
  // Cached by React's cache() — this re-reads the same request-scoped result
  // the layout already fetched, not a second database round trip.
  const admin = await getControlCenterAdmin();
  const plannedModules = admin ? getVisibleModules(admin.role).filter((module) => module.availability === 'planned') : [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Welcome to the Oxiom Control Center</h1>
      <p className="mt-2 text-sm text-slate-600">
        This is the foundation checkpoint. Access, navigation, and layout are live — the modules below are not yet implemented.
      </p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
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
