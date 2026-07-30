import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import '../../../lib/urp/bootstrap';
import { listReports } from '../../../lib/urp/registry';

const statusTone: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
};

export default async function ReportsPlatformPage() {
  await requireControlCenterAccess();
  const reports = listReports();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Universal Report Platform</h1>
      <p className="mt-2 text-sm text-slate-600">
        Every report registered via URP (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">lib/urp/</code>).
        Read-only -- no editing UI in this milestone.
      </p>

      <div className="mt-6 space-y-4">
        {reports.map((report) => (
          <div key={report.metadata.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{report.metadata.name}</p>
                <p className="text-xs text-slate-500">
                  {report.metadata.id} &middot; v{report.metadata.version} &middot; {report.metadata.sourceEngine}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusTone[report.status] ?? 'bg-slate-100 text-slate-500'}`}>
                {report.status}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-700">{report.metadata.description}</p>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</dt>
                <dd className="mt-1 text-xs text-slate-600">{report.metadata.category}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Supported Formats</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {report.supportedFormats.map((format) => (
                    <span key={format} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-600">
                      {format}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Input Schema</dt>
                <dd className="mt-1 font-mono text-xs text-slate-500">{report.metadata.inputSchema || '—'}</dd>
              </div>
            </dl>
          </div>
        ))}

        {reports.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No reports are registered.</p>
        )}
      </div>
    </div>
  );
}
