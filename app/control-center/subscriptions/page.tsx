import Link from 'next/link';
import { listSubscriptionDirectory } from '../../../lib/control-center/subscriptions';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { listOrganizationOptions } from '../../../lib/control-center/trials';
import { listCommercialPlanOptions } from '../../../lib/control-center/customers';
import { createSubscription } from './actions';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

const statusTone: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-slate-200 text-slate-600',
  expired: 'bg-rose-100 text-rose-700',
};

function StatusPill({ value }: Readonly<{ value: string }>) {
  const tone = statusTone[value] ?? 'bg-slate-100 text-slate-500';
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${tone}`}>{value}</span>;
}

const statusFilters = ['active', 'suspended', 'cancelled', 'expired'];

export default async function ControlCenterSubscriptionsPage({ searchParams }: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
  await requireControlCenterAccess();
  const { status } = await searchParams;
  const [subscriptions, organizations, plans] = await Promise.all([
    listSubscriptionDirectory(status),
    listOrganizationOptions(),
    listCommercialPlanOptions(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Subscriptions</h1>
      <p className="mt-2 text-sm text-slate-600">The commercial source of truth — every customer&apos;s active, suspended, cancelled, and expired subscriptions.</p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Create a subscription</h2>
        <form action={createSubscription} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Organization</span>
            <select name="organizationId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Commercial plan</span>
            <select name="planId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.productSlug} — {plan.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Billing cycle</span>
            <select name="billingCycle" defaultValue="monthly" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Start date</span>
            <input type="date" name="startDate" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <span className="mt-0.5 block text-[11px] text-slate-400">Leave blank to start today. Renewal date is computed from the billing cycle.</span>
          </label>
          <div className="flex items-end">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              Create subscription
            </button>
          </div>
        </form>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/control-center/subscriptions"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${!status ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          All
        </Link>
        {statusFilters.map((entry) => (
          <Link
            key={entry}
            href={`/control-center/subscriptions?status=${entry}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${status === entry ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            {entry}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Product / Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Billing</th>
              <th className="px-4 py-3">Start date</th>
              <th className="px-4 py-3">Renews</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No subscriptions match this filter.</td>
              </tr>
            ) : (
              subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/control-center/subscriptions/${subscription.id}`} className="font-semibold text-slate-900 hover:text-blue-700">
                      {subscription.organizationName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{subscription.productSlug} · {subscription.planName}</td>
                  <td className="px-4 py-3"><StatusPill value={subscription.status} /></td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{subscription.billingCycle}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(subscription.startDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(subscription.renewalDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
