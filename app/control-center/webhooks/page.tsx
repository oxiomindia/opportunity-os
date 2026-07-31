import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import '../../../lib/webhooks/bootstrap';
import { listEndpoints } from '../../../lib/webhooks/registry';
import { getDeadLetterQueue, getEndpointDiagnostics } from '../../../lib/webhooks/delivery';
import type { DeliveryStatus, WebhookStatus } from '../../../lib/webhooks/types';

const statusTone: Record<WebhookStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  disabled: 'bg-slate-100 text-slate-500',
};

const deliveryTone: Record<DeliveryStatus, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-800',
  exhausted: 'bg-red-100 text-red-800',
};

function formatMs(value: number | undefined): string {
  return value === undefined ? '—' : `${Math.round(value)}ms`;
}

function formatRate(value: number | undefined): string {
  return value === undefined ? '—' : `${value}%`;
}

export default async function WebhookEngineAdminPage() {
  await requireControlCenterAccess();

  const endpoints = listEndpoints();
  const diagnostics = endpoints.map((endpoint) => getEndpointDiagnostics(endpoint.id)).filter((entry) => entry !== undefined);
  const deadLetterQueue = getDeadLetterQueue();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Webhook Engine</h1>
      <p className="mt-2 text-sm text-slate-600">
        Outbound webhook endpoints subscribed to the platform Event Bus (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">lib/webhooks/</code>).
        Read-only -- no editing UI in this milestone.
      </p>

      <div className="mt-6 space-y-6">
        {diagnostics.map(({ endpoint, metrics, recentDeliveries, pendingRetries }) => (
          <div key={endpoint.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{endpoint.url}</p>
                <p className="text-xs text-slate-500">
                  {endpoint.id} &middot; v{endpoint.version}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusTone[endpoint.status]}`}>{endpoint.status}</span>
            </div>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Subscribed Events</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {endpoint.eventFilters.map((filter) => (
                    <span key={filter} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {filter}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Secret Status</dt>
                <dd className="mt-1 text-xs text-slate-600">
                  v{endpoint.secretStatus.version} &middot; rotated {endpoint.secretStatus.rotatedAt}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Success Rate</dt>
                <dd className="mt-1 text-xs text-slate-600">{formatRate(metrics.successRate)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average Delivery Time</dt>
                <dd className="mt-1 text-xs text-slate-600">{formatMs(metrics.averageDeliveryTimeMs)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Failure Count</dt>
                <dd className="mt-1 text-xs text-slate-600">{metrics.failureCount}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last Delivery</dt>
                <dd className="mt-1 text-xs text-slate-600">
                  {metrics.lastDeliveryAt ? `${metrics.lastDeliveryStatus} at ${metrics.lastDeliveryAt}` : 'No deliveries yet'}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Retry Queue ({pendingRetries.length})</p>
              {pendingRetries.length === 0 ? (
                <p className="mt-1 text-xs text-slate-500">Nothing pending.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {pendingRetries.map((attempt) => (
                    <li key={attempt.id} className="text-xs text-slate-600">
                      {attempt.eventName} &middot; attempt {attempt.attemptNumber} &middot; next retry {attempt.nextRetryAt}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent Deliveries</p>
              {recentDeliveries.length === 0 ? (
                <p className="mt-1 text-xs text-slate-500">No deliveries recorded yet.</p>
              ) : (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="py-1 pr-3">Event</th>
                        <th className="py-1 pr-3">Attempt</th>
                        <th className="py-1 pr-3">Status</th>
                        <th className="py-1 pr-3">HTTP</th>
                        <th className="py-1 pr-3">Duration</th>
                        <th className="py-1">Attempted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDeliveries.map((attempt) => (
                        <tr key={attempt.id} className="border-t border-slate-100">
                          <td className="py-1 pr-3 text-slate-700">{attempt.eventName}</td>
                          <td className="py-1 pr-3 text-slate-500">{attempt.attemptNumber}</td>
                          <td className="py-1 pr-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${deliveryTone[attempt.status]}`}>{attempt.status}</span>
                          </td>
                          <td className="py-1 pr-3 text-slate-500">{attempt.httpStatus ?? '—'}</td>
                          <td className="py-1 pr-3 text-slate-500">{formatMs(attempt.durationMs)}</td>
                          <td className="py-1 text-slate-500">{attempt.attemptedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}

        {diagnostics.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No webhook endpoints are registered.
          </p>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Dead Letter Queue ({deadLetterQueue.length})</p>
          <p className="mt-1 text-xs text-slate-500">Deliveries that exhausted every retry attempt.</p>
          {deadLetterQueue.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">Empty.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {deadLetterQueue.slice(0, 20).map((attempt) => (
                <li key={attempt.id} className="text-xs text-slate-600">
                  {attempt.eventName} &middot; endpoint {attempt.endpointId} &middot; {attempt.attemptNumber} attempts &middot; {attempt.error ?? 'unknown error'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
