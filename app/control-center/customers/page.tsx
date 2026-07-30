import Link from 'next/link';
import { listCustomerDirectory } from '../../../lib/control-center/customers';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

const statusTone: Record<string, string> = {
  none: 'bg-slate-100 text-slate-500',
  active: 'bg-emerald-100 text-emerald-700',
  trialing: 'bg-blue-100 text-blue-700',
  expired: 'bg-amber-100 text-amber-700',
  converted: 'bg-emerald-100 text-emerald-700',
  past_due: 'bg-amber-100 text-amber-700',
  canceled: 'bg-slate-200 text-slate-600',
};

function StatusPill({ value }: Readonly<{ value: string }>) {
  const tone = statusTone[value] ?? 'bg-slate-100 text-slate-500';
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${tone}`}>{value.replace('_', ' ')}</span>;
}

export default async function ControlCenterCustomersPage({ searchParams }: Readonly<{ searchParams: Promise<{ q?: string }> }>) {
  await requireControlCenterAccess();
  const { q } = await searchParams;
  const customers = await listCustomerDirectory(q);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Customers</h1>
      <p className="mt-2 text-sm text-slate-600">Every organization on the platform, with commercial status where it&apos;s been recorded.</p>

      <form action="/control-center/customers" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search by company, contact, GST, city, or owner email"
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
          Search
        </button>
        {q && (
          <Link href="/control-center/customers" className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Owner email</th>
              <th className="px-4 py-3">City / Country</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Trial</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3">Renewal</th>
              <th className="px-4 py-3">Last login</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">No customers match this search.</td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.organizationId} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/control-center/customers/${customer.organizationId}`} className="font-semibold text-slate-900 hover:text-blue-700">
                      {customer.name}
                    </Link>
                    <p className="text-xs text-slate-400">{customer.contactPerson ?? 'No contact on file'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{customer.ownerEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{[customer.city, customer.country].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.planName ?? '—'}</td>
                  <td className="px-4 py-3"><StatusPill value={customer.trialStatus} /></td>
                  <td className="px-4 py-3"><StatusPill value={customer.subscriptionStatus} /></td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(customer.renewalDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.lastLoginAt ? formatDate(customer.lastLoginAt) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
