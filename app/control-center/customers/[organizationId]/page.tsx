import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCustomerDirectoryRow,
  listCustomerTimeline,
  listCustomerNotes,
  listCommercialPlanOptions,
} from '../../../../lib/control-center/customers';
import { updateCustomerProfile, addCustomerNote } from '../actions';

function toDateInput(value: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default async function CustomerProfilePage({ params }: Readonly<{ params: Promise<{ organizationId: string }> }>) {
  const { organizationId } = await params;
  const [customer, timeline, notes, plans] = await Promise.all([
    getCustomerDirectoryRow(organizationId),
    listCustomerTimeline(organizationId),
    listCustomerNotes(organizationId),
    listCommercialPlanOptions(),
  ]);

  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer profile</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{customer.name}</h1>
      <p className="mt-1 text-sm text-slate-600">{customer.ownerEmail ?? 'No owner on file'} · Edition: {customer.edition.replace('_', ' ')}</p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Trial</h2>
          <Link href="/control-center/trials" className="text-xs font-semibold text-blue-700 hover:text-blue-800">
            Manage in Trials →
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-800 capitalize">{customer.trialStatus.replace('_', ' ')}</p>
        <p className="mt-1 text-xs text-slate-500">
          {customer.trialEndsAt ? `Ends ${new Date(customer.trialEndsAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}` : 'No active trial'}
        </p>
        <p className="mt-2 text-[11px] text-slate-400">
          Trial lifecycle (start, extend, expire, convert, reject) is now owned by the Trials module, not this form.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Commercial profile</h2>
        <form action={updateCustomerProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
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

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Subscription status</span>
            <select name="subscriptionStatus" defaultValue={customer.subscriptionStatus} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="none">None</option>
              <option value="trialing">Trialing</option>
              <option value="active">Active</option>
              <option value="past_due">Past due</option>
              <option value="canceled">Canceled</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Primary plan</span>
            <select name="primaryPlanId" defaultValue={customer.primaryPlanId ?? ''} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">No plan set</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.productSlug} — {plan.name}
                </option>
              ))}
            </select>
            <span className="mt-0.5 block text-[11px] text-slate-400">
              The headline plan shown on the directory — an org holding several concurrent plans is tracked by the future Subscriptions module.
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Renewal date</span>
            <input type="date" name="renewalDate" defaultValue={toDateInput(customer.renewalDate)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Reason for this change (optional)</span>
            <input type="text" name="reason" maxLength={500} placeholder="e.g. Approved trial request, confirmed by email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Customer timeline</h2>
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

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Internal notes</h2>
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
