import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubscriptionDetail, listSubscriptionEvents } from '../../../../lib/control-center/subscriptions';
import { listCommercialPlanOptions } from '../../../../lib/control-center/customers';
import { upgradeSubscription, downgradeSubscription, suspendSubscription, cancelSubscription, reactivateSubscription, expireSubscription } from '../actions';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatPaise(paise: number | null, currency: string | null): string {
  if (paise === null || !currency) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(paise / 100);
}

const statusTone: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-slate-200 text-slate-600',
  expired: 'bg-rose-100 text-rose-700',
};

export default async function SubscriptionDetailPage({ params }: Readonly<{ params: Promise<{ subscriptionId: string }> }>) {
  const { subscriptionId } = await params;
  const [subscription, events, plans] = await Promise.all([
    getSubscriptionDetail(subscriptionId),
    listSubscriptionEvents(subscriptionId),
    listCommercialPlanOptions(),
  ]);

  if (!subscription) notFound();

  const productPlans = plans.filter((plan) => plan.productSlug === subscription.productSlug && plan.id !== subscription.planId);
  const canChangePlan = subscription.status === 'active';
  const canSuspendOrExpire = subscription.status === 'active';
  const canCancel = subscription.status === 'active' || subscription.status === 'suspended';
  const canReactivate = subscription.status === 'suspended' || subscription.status === 'cancelled';

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/control-center/subscriptions" className="text-xs font-semibold text-slate-500 hover:text-slate-700">← All subscriptions</Link>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{subscription.organizationName}</h1>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusTone[subscription.status] ?? 'bg-slate-100 text-slate-500'}`}>
          {subscription.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {subscription.productSlug} · {subscription.planName} · {subscription.billingCycle} billing
        {subscription.sourceTrialId && (
          <> · converted from <Link href={`/control-center/trials/${subscription.sourceTrialId}`} className="font-semibold text-blue-700 hover:text-blue-800">a trial</Link></>
        )}
      </p>

      <section className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Start date</p>
          <p className="mt-1 text-sm text-slate-800">{formatDate(subscription.startDate)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Renewal date</p>
          <p className="mt-1 text-sm text-slate-800">{formatDate(subscription.renewalDate)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current price ({subscription.region})</p>
          <p className="mt-1 text-sm text-slate-800">
            {subscription.billingCycle === 'annual'
              ? `${formatPaise(subscription.annualPricePaise, subscription.currency)} / year`
              : `${formatPaise(subscription.monthlyPricePaise, subscription.currency)} / month`}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">Read live from the plan&apos;s current price — never stored on the subscription.</p>
        </div>
      </section>

      {(canChangePlan || canSuspendOrExpire || canCancel || canReactivate) && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Actions</h2>

          {canChangePlan && (
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <form action={upgradeSubscription} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="text-xs font-semibold text-emerald-800">Upgrade</p>
                <input type="hidden" name="subscriptionId" value={subscription.id} />
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">New plan</span>
                  <select name="planId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    {productPlans.length === 0 && <option value="">No other plans for this product</option>}
                    {productPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                  </select>
                </label>
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">Reason (optional)</span>
                  <input type="text" name="reason" maxLength={500} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <button type="submit" className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                  Upgrade
                </button>
              </form>

              <form action={downgradeSubscription} className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-800">Downgrade</p>
                <input type="hidden" name="subscriptionId" value={subscription.id} />
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">New plan</span>
                  <select name="planId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    {productPlans.length === 0 && <option value="">No other plans for this product</option>}
                    {productPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                  </select>
                </label>
                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">Reason (optional)</span>
                  <input type="text" name="reason" maxLength={500} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                  Downgrade
                </button>
              </form>
            </div>
          )}

          {(canSuspendOrExpire || canCancel || canReactivate) && (
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              {canSuspendOrExpire && (
                <form action={suspendSubscription} className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                  <p className="text-xs font-semibold text-amber-800">Suspend</p>
                  <input type="hidden" name="subscriptionId" value={subscription.id} />
                  <input type="text" name="reason" placeholder="Reason (optional)" maxLength={500} className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  <button type="submit" className="mt-3 rounded-md bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800">
                    Suspend
                  </button>
                </form>
              )}
              {canCancel && (
                <form action={cancelSubscription} className="rounded-lg border border-rose-100 bg-rose-50/50 p-4">
                  <p className="text-xs font-semibold text-rose-800">Cancel</p>
                  <input type="hidden" name="subscriptionId" value={subscription.id} />
                  <input type="text" name="reason" placeholder="Reason (optional)" maxLength={500} className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  <button type="submit" className="mt-3 rounded-md bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800">
                    Cancel
                  </button>
                </form>
              )}
              {canReactivate && (
                <form action={reactivateSubscription} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                  <p className="text-xs font-semibold text-emerald-800">Reactivate</p>
                  <input type="hidden" name="subscriptionId" value={subscription.id} />
                  <input type="text" name="reason" placeholder="Reason (optional)" maxLength={500} className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  <button type="submit" className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                    Reactivate
                  </button>
                </form>
              )}
              {canSuspendOrExpire && (
                <form action={expireSubscription} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-800">Mark expired</p>
                  <input type="hidden" name="subscriptionId" value={subscription.id} />
                  <input type="text" name="reason" placeholder="Reason (optional)" maxLength={500} className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                    Expire
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Subscription timeline</h2>
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
    </div>
  );
}
