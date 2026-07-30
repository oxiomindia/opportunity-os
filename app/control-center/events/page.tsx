import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import '../../../lib/engine/bootstrap';
import { listEngines } from '../../../lib/engine/registry';
import { eventBus } from '../../../lib/events/bus';
import type { EventDeliveryStatus } from '../../../lib/events/types';

const statusTone: Record<EventDeliveryStatus, string> = {
  delivered: 'bg-emerald-100 text-emerald-700',
  'partial-failure': 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-800',
  'no-subscribers': 'bg-slate-100 text-slate-500',
};

export default async function EventMonitorPage() {
  await requireControlCenterAccess();

  // Every engine's getHealth() publishes an engine.health-checked event
  // (see lib/itcRecovery/engine.ts et al.). Running a health check across
  // every registered engine gives this read-only monitor real, fresh
  // events to show rather than an empty log or a synthetic event source.
  await Promise.all(listEngines().map((engine) => engine.getHealth()));

  const { recentEvents, totalPublished, totalSubscriptions } = eventBus.getDiagnostics();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Event Monitor</h1>
      <p className="mt-2 text-sm text-slate-600">
        Recent events published on the platform Event Bus (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">lib/events/</code>).
        Read-only -- no replay or queue management in this milestone.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {totalPublished} event{totalPublished === 1 ? '' : 's'} published this server instance &middot; {totalSubscriptions} active subscription
        {totalSubscriptions === 1 ? '' : 's'}.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Event Name</th>
              <th className="px-4 py-3">Source Engine</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Correlation ID</th>
            </tr>
          </thead>
          <tbody>
            {recentEvents.map((event) => (
              <tr key={event.eventId} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{event.eventName}</td>
                <td className="px-4 py-3 text-slate-600">{event.sourceEngine}</td>
                <td className="px-4 py-3 text-slate-500">{event.timestamp}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusTone[event.status]}`}>{event.status}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{event.correlationId}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {recentEvents.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No events have been published yet.</p>}
      </div>
    </div>
  );
}
