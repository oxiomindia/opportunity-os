import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTrialDetail, listTrialEvents, listTrialNotes } from '../../../../lib/control-center/trials';
import { requireControlCenterAccess } from '../../../../lib/control-center/auth';
import { listCommercialPlanOptions } from '../../../../lib/control-center/customers';
import { setTrialUnderReview, approveTrial, rejectTrial, extendTrial, expireTrial, convertTrial, addTrialNote } from '../actions';

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toDateTimeLocal(value: string | null): string {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 16);
}

const statusTone: Record<string, string> = {
  requested: 'bg-slate-100 text-slate-600',
  under_review: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-amber-100 text-amber-700',
  converted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

export default async function TrialDetailPage({ params }: Readonly<{ params: Promise<{ trialId: string }> }>) {
  await requireControlCenterAccess();
  const { trialId } = await params;
  const [trial, events, notes, plans] = await Promise.all([
    getTrialDetail(trialId),
    listTrialEvents(trialId),
    listTrialNotes(trialId),
    listCommercialPlanOptions(),
  ]);

  if (!trial) notFound();

  const productPlans = plans.filter((plan) => plan.productSlug === trial.productSlug);
  const canDecide = trial.status === 'requested' || trial.status === 'under_review';
  const canMarkUnderReview = trial.status === 'requested';
  const canExtendOrExpire = trial.status === 'active';
  const canConvert = trial.status === 'active' || trial.status === 'expired';

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/control-center/trials" className="text-xs font-semibold text-slate-500 hover:text-slate-700">← All trials</Link>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{trial.organizationName}</h1>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusTone[trial.status] ?? 'bg-slate-100 text-slate-500'}`}>
          {trial.status.replace('_', ' ')}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {trial.productSlug} · {trial.contactPerson ?? 'No contact on file'} {trial.contactEmail ? `· ${trial.contactEmail}` : ''}
      </p>

      <section className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Started</p>
          <p className="mt-1 text-sm text-slate-800">{formatDateTime(trial.startedAt)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ends</p>
          <p className="mt-1 text-sm text-slate-800">{formatDateTime(trial.endsAt)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Extensions</p>
          <p className="mt-1 text-sm text-slate-800">{trial.extensionCount}</p>
        </div>
        {trial.status === 'rejected' && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rejection reason</p>
            <p className="mt-1 text-sm text-slate-800">{trial.rejectedReason}</p>
          </div>
        )}
      </section>

      {(canDecide || canMarkUnderReview || canExtendOrExpire || canConvert) && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {canMarkUnderReview && (
              <form action={setTrialUnderReview}>
                <input type="hidden" name="trialId" value={trial.id} />
                <button type="submit" className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Mark under review
                </button>
              </form>
            )}
          </div>

          {canDecide && (
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <form action={approveTrial} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="text-xs font-semibold text-emerald-800">Approve &amp; start trial</p>
                <input type="hidden" name="trialId" value={trial.id} />
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">Duration (days)</span>
                  <input type="number" name="durationDays" defaultValue={7} min={1} max={365} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">Reason (optional)</span>
                  <input type="text" name="reason" maxLength={500} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <button type="submit" className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                  Approve
                </button>
              </form>

              <form action={rejectTrial} className="rounded-lg border border-rose-100 bg-rose-50/50 p-4">
                <p className="text-xs font-semibold text-rose-800">Reject request</p>
                <input type="hidden" name="trialId" value={trial.id} />
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">Reason (required)</span>
                  <input type="text" name="rejectedReason" required minLength={2} maxLength={500} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <button type="submit" className="mt-3 rounded-md bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800">
                  Reject
                </button>
              </form>
            </div>
          )}

          {canExtendOrExpire && (
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <form action={extendTrial} className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-800">Extend trial</p>
                <input type="hidden" name="trialId" value={trial.id} />
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">New end date</span>
                  <input type="datetime-local" name="newEndsAt" required defaultValue={toDateTimeLocal(trial.endsAt)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">Reason (optional)</span>
                  <input type="text" name="reason" maxLength={500} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                  Extend
                </button>
              </form>

              <form action={expireTrial} className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                <p className="text-xs font-semibold text-amber-800">Mark expired</p>
                <input type="hidden" name="trialId" value={trial.id} />
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">Reason (optional)</span>
                  <input type="text" name="reason" maxLength={500} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <button type="submit" className="mt-3 rounded-md bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800">
                  Expire
                </button>
              </form>
            </div>
          )}

          {canConvert && (
            <form action={convertTrial} className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-xs font-semibold text-emerald-800">Convert to paying customer</p>
              <input type="hidden" name="trialId" value={trial.id} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">Plan</span>
                  <select name="planId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    {productPlans.length === 0 && <option value="">No plans for this product</option>}
                    {productPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">Reason (optional)</span>
                  <input type="text" name="reason" maxLength={500} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
              </div>
              <button type="submit" className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                Convert
              </button>
            </form>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Trial timeline</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">No events yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {events.map((event) => (
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
        <form action={addTrialNote} className="mt-4 flex gap-2">
          <input type="hidden" name="trialId" value={trial.id} />
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
