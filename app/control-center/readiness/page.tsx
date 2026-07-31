import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { runDemoExperienceChecks } from '../../../lib/growthOps/demoExperience';
import { computeReadinessReport } from '../../../lib/growthOps/readinessDashboard';
import type { ReadinessItem } from '../../../lib/growthOps/readinessDashboard';

export default async function ReadinessPage() {
  await requireControlCenterAccess();

  const demoChecks = runDemoExperienceChecks();
  const readiness = await computeReadinessReport();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Demo Experience &amp; Deployment Readiness</h1>
      <p className="mt-2 text-sm text-slate-600">
        Live checks against the real demo dataset and platform registries (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">lib/growthOps/</code>).
        Read-only.
      </p>

      <Section title="Demo Experience">
        <div className="grid gap-2 sm:grid-cols-2">
          {demoChecks.map((check) => (
            <div key={check.area} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{check.area}</p>
                <Badge ready={check.status === 'pass'} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{check.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <ReadinessSection title="Demo Data" items={readiness.demoData} />
      <ReadinessSection title="Growth" items={readiness.growth} />
      <ReadinessSection title="SEO" items={readiness.seo} />
      <ReadinessSection title="Commercial" items={readiness.commercial} />
      <ReadinessSection title="Platform" items={readiness.platform} />
    </div>
  );
}

function ReadinessSection({ title, items }: { title: string; items: ReadinessItem[] }) {
  return (
    <Section title={title}>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((entry) => (
          <div key={entry.label} className="rounded-lg border border-slate-100 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
              <Badge ready={entry.ready} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{entry.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Badge({ ready }: { ready: boolean }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ready ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-800'}`}>{ready ? 'Ready' : 'Not ready'}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
