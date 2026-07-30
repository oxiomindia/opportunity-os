import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomerDirectoryRow, listCustomerTimeline, listCustomerNotes } from '../../../../lib/control-center/customers';
import { listTrialsForOrganization } from '../../../../lib/control-center/trials';
import { listSubscriptionsForOrganization } from '../../../../lib/control-center/subscriptions';
import { updateCustomerProfile, addCustomerNote } from '../actions';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const trialStatusTone: Record<string, string> = {
  requested: 'bg-slate-100 text-slate-600',
  under_review: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-amber-100 text-amber-700',
  converted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

const subscriptionStatusTone: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-slate-200 text-slate-600',
  expired: 'bg-rose-100 text-rose-700',
};

function Pill({ value, tone }: Readonly<{ value: string; tone: Record<string, string> }>) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${tone[value] ?? 'bg-slate-100 text-slate-500'}`}>{value.replace('_', ' ')}</span>;
}

export default async function CustomerProfilePage({ params }: Readonly<{ params: Promise<{ organizationId: string }> }>) {
  const { organizationId } = await params;
  const [customer, trials, subscriptions, timeline, notes] = await Promise.all([
    getCustomerDirectoryRow(organizationId),
    listTrialsForOrganization(organizationId),
    listSubscriptionsForOrganization(organizationId),
    listCustomerTimeline(organizationId),
    listCustomerNotes(organizationId),
  ]);

  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer profile</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{customer.name}</h1>
      <p className="mt-1 text-sm text-slate-600">{customer.ownerEmail ?? 'No owner on file'} · Edition: {customer.edition.replace('_', ' ')}</p>

      {/* Overview */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <p className="text-slate-600">Primary plan: <span className="font-medium text-slate-900">{customer.planName ?? 'None'}</span></p>
          <p className="text-slate-600">Subscription: <span className="font-medium capitalize text-slate-900">{customer.subscriptionStatus.replace('_', ' ')}</span></p>
          <p className="text-slate-600">Renews: <span className="font-medium text-slate-900">{formatDate(customer.renewalDate)}</span></p>
          <p className="text-slate-600">Trial: <span className="font-medium capitalize text-slate-900">{customer.trialStatus.replace('_', ' ')}</span></p>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Trial and Subscription lifecycles are owned by their own modules below — this summary is read-only.
        </p>

        <form action={updateCustomerProfile} className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <input type="hidden" name="organizationId" value={customer.organizationId} />
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">GST number</span>
            <input type="text" name="gstNumber" defaultValue={customer.gstNumber ?? ''} maxLength={30} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Contact person</span>
            <input type="text" name="contactPerson" defaultValue={customer.contactPerson ?? ''} maxLength={120} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Contact mobile</span>
            <input type="text" name="contactMobile" defaultValue={customer.contactMobile ?? ''} maxLength={20} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">City</span>
              <input type="text" name="city" defaultValue={customer.city ?? ''} maxLength={80} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Country</span>
              <input type="text" name="country" defaultValue={customer.country ?? ''} maxLength={80} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Reason for this change (optional)</span>
            <input type="text" name="reason" maxLength={500} placeholder="e.g. Corrected GST number" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              Save profile
            </button>
          </div>
        </form>
      </section>

      {/* Trials */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Trials</h2>
          <Link href="/control-center/trials" className="text-xs font-semibold text-blue-700 hover:text-blue-800">Manage in Trials →</Link>
        </div>
        {trials.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">No trials for this organization yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {trials.map((trial) => (
              <li key={trial.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                <div>
                  <Link href={`/control-center/trials/${trial.id}`} className="font-semibold text-slate-900 hover:text-blue-700">{trial.productSlug}</Link>
                  <p className="text-xs text-slate-500">{formatDate(trial.startedAt)} – {formatDate(trial.endsAt)}</p>
                </div>
                <Pill value={trial.status} tone={trialStatusTone} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Subscriptions */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Subscriptions</h2>
          <Link href="/control-center/subscriptions" className="text-xs font-semibold text-blue-700 hover:text-blue-800">Manage in Subscriptions →</Link>
        </div>
        {subscriptions.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">No subscriptions for this organization yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {subscriptions.map((subscription) => (
              <li key={subscription.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                <div>
                  <Link href={`/control-center/subscriptions/${subscription.id}`} className="font-semibold text-slate-900 hover:text-blue-700">
                    {subscription.productSlug} — {subscription.planName}
                  </Link>
                  <p className="text-xs text-slate-500">{subscription.billingCycle} · renews {formatDate(subscription.renewalDate)}</p>
                </div>
                <Pill value={subscription.status} tone={subscriptionStatusTone} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Timeline */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Timeline</h2>
        {timeline.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">No lifecycle events recorded yet — they appear here automatically when trial or subscription status changes.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {timeline.map((event) => (
              <li key={event.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" aria-hidden="true" />
                <div>
                  <p className="text-slate-800">{event.eventSummary}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(event.occurredAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notes */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Notes</h2>
        <form action={addCustomerNote} className="mt-4 flex gap-2">
          <input type="hidden" name="organizationId" value={customer.organizationId} />
          <input
            type="text"
            name="note"
            required
            minLength={2}
            maxLength={4000}
            placeholder="Add a note only other Owners can see"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
            Add note
          </button>
        </form>
        {notes.length === 0 ? (
          <p className="mt-4 text-xs text-slate-400">No notes yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                <p className="text-slate-800">{note.note}</p>
                <p className="mt-1 text-xs text-slate-400">{note.authorEmail ?? 'Unknown'} · {formatDateTime(note.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
