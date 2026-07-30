import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import '../../../lib/engine/bootstrap';
import { listEngines } from '../../../lib/engine/registry';
import type { EngineHealth } from '../../../lib/engine/types';

const statusTone: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
  degraded: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-800',
};

const healthTone: Record<EngineHealth['status'], string> = {
  healthy: 'bg-emerald-100 text-emerald-700',
  degraded: 'bg-amber-100 text-amber-700',
  unhealthy: 'bg-red-100 text-red-800',
  unknown: 'bg-slate-100 text-slate-500',
};

export default async function EngineRegistryPage() {
  await requireControlCenterAccess();
  const engines = listEngines();
  const rows = await Promise.all(
    engines.map(async (engine) => ({
      engine,
      health: await engine.getHealth(),
      configuration: engine.getConfiguration(),
    }))
  );

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Engine Registry</h1>
      <p className="mt-2 text-sm text-slate-600">
        Every platform engine registered via the Engine Framework (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">lib/engine/</code>).
        Read-only — this milestone defines the shared engine contract and registration mechanism, not engine management actions.
      </p>

      <div className="mt-6 space-y-4">
        {rows.map(({ engine, health, configuration }) => (
          <div key={engine.metadata.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{engine.metadata.name}</p>
                <p className="text-xs text-slate-500">
                  {engine.metadata.id} &middot; v{engine.metadata.version}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusTone[engine.getStatus()] ?? 'bg-slate-100 text-slate-500'}`}>
                  {engine.getStatus()}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${healthTone[health.status]}`}>
                  {health.status}
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-700">{engine.metadata.description}</p>
            {health.message && <p className="mt-1 text-xs text-amber-700">{health.message}</p>}

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Capabilities</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {engine.metadata.capabilities.length === 0 ? (
                    <span className="text-xs text-slate-400">None declared</span>
                  ) : (
                    engine.metadata.capabilities.map((capability) => (
                      <span key={capability} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {capability}
                      </span>
                    ))
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dependencies</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {engine.metadata.dependencies.length === 0 ? (
                    <span className="text-xs text-slate-400">None</span>
                  ) : (
                    engine.metadata.dependencies.map((dependency) => (
                      <span key={dependency} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {dependency}
                      </span>
                    ))
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Inputs</dt>
                <dd className="mt-1 text-xs text-slate-600">{engine.metadata.inputs.join(', ') || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Outputs</dt>
                <dd className="mt-1 text-xs text-slate-600">{engine.metadata.outputs.join(', ') || '—'}</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Configuration</dt>
              <dd className="mt-1 text-xs text-slate-500">
                {Object.keys(configuration).length === 0 ? 'No engine-owned configuration surfaced yet.' : JSON.stringify(configuration)}
              </dd>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No engines are registered.
          </p>
        )}
      </div>
    </div>
  );
}
