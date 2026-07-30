import Link from 'next/link';
import { listAuditLogs, listAuditLogEntityTypes } from '../../../lib/control-center/audit';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function buildHref(entityType: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (entityType) params.set('entityType', entityType);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/control-center/audit-logs?${query}` : '/control-center/audit-logs';
}

export default async function ControlCenterAuditLogsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ entityType?: string; page?: string }> }>) {
  const { entityType, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ entries, hasMore }, entityTypes] = await Promise.all([
    listAuditLogs({ entityType, page }),
    listAuditLogEntityTypes(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Audit Logs</h1>
      <p className="mt-2 text-sm text-slate-600">
        Every commercial action taken through the Control Center — pricing changes, product visibility, and customer
        profile edits. Append-only: entries here can never be edited or deleted, including by the actor who made them.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={buildHref(undefined, 1)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!entityType ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
        >
          All
        </Link>
        {entityTypes.map((type) => (
          <Link
            key={type}
            href={buildHref(type, 1)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${entityType === type ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            {type.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400">No audit entries yet.</p>
        ) : (
          entries.map((entry) => (
            <details key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-semibold text-slate-900">{entry.action}</span>
                  <span className="ml-2 text-slate-500">{entry.entityType.replace(/_/g, ' ')}</span>
                </span>
                <span className="text-xs text-slate-400">{entry.actorEmail ?? 'Unknown actor'} · {formatDateTime(entry.occurredAt)}</span>
              </summary>
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                {entry.reason && <p><span className="font-semibold text-slate-700">Reason:</span> {entry.reason}</p>}
                {entry.requestId && <p><span className="font-semibold text-slate-700">Request ID:</span> <span className="font-mono">{entry.requestId}</span></p>}
                {entry.entityId && <p><span className="font-semibold text-slate-700">Entity ID:</span> <span className="font-mono">{entry.entityId}</span></p>}
                {(entry.beforeState != null || entry.afterState != null) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-slate-700">Before</p>
                      <pre className="mt-1 overflow-x-auto rounded-md bg-slate-50 p-2">{entry.beforeState ? JSON.stringify(entry.beforeState, null, 2) : '—'}</pre>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">After</p>
                      <pre className="mt-1 overflow-x-auto rounded-md bg-slate-50 p-2">{entry.afterState ? JSON.stringify(entry.afterState, null, 2) : '—'}</pre>
                    </div>
                  </div>
                )}
              </div>
            </details>
          ))
        )}
      </div>

      {(page > 1 || hasMore) && (
        <div className="mt-6 flex justify-between">
          {page > 1 ? (
            <Link href={buildHref(entityType, page - 1)} className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              ← Newer
            </Link>
          ) : <span />}
          {hasMore ? (
            <Link href={buildHref(entityType, page + 1)} className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Older →
            </Link>
          ) : <span />}
        </div>
      )}
    </div>
  );
}
