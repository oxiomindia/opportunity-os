import Link from 'next/link';
import { mockActivityEvents } from '../../../data/mockActivity';
import type { ActivityCategory, ActivitySeverity } from '../../../types/activity';
import EmptyState from '../../components/EmptyState';

const severityClasses: Record<ActivitySeverity, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  critical: 'border-red-200 bg-red-50 text-red-700',
};

const categoryLabels: Record<ActivityCategory, string> = {
  invoice: 'Invoice',
  system: 'System',
};

function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export default function ActivityPage() {
  const unreadCount = mockActivityEvents.filter((event) => event.unread).length;
  const criticalCount = mockActivityEvents.filter((event) => event.severity === 'critical').length;
  const categories = Array.from(new Set(mockActivityEvents.map((event) => event.category)));

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Notifications</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Activity center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Monitor invoice status changes, payment updates, and system events across Oxiom from one audit-friendly feed.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Unread notifications</p>
          <p className="mt-2 text-3xl font-semibold text-blue-700">{unreadCount}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Critical alerts</p>
          <p className="mt-2 text-3xl font-semibold text-red-700">{criticalCount}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Active channels</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{categories.length}</p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">Recent activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {mockActivityEvents.length === 0 && (
              <div className="p-5">
                <EmptyState icon="○" title="No activity yet" description="Invoice status changes, payment updates, and system events will appear here as they happen." />
              </div>
            )}
            {mockActivityEvents.map((event) => (
              <article key={event.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severityClasses[event.severity]}`}>
                      {event.severity}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {categoryLabels[event.category]}
                    </span>
                    {event.unread && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">Unread</span>}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-slate-950">{event.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{event.description}</p>
                  <p className="mt-2 text-xs text-slate-500">{event.actor} · {formatActivityTime(event.createdAt)}</p>
                </div>
                {event.href && (
                  <Link href={event.href} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700">
                    View context
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Notification routing</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Critical invoice alerts, like overdue payments, notify you immediately.</li>
            <li>Payment confirmations are grouped into the daily billing digest.</li>
            <li>System events remain available for audit and operational reporting.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
