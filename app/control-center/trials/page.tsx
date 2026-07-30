import Link from 'next/link';
import { listTrialDirectory, listOrganizationOptions, listProductOptions } from '../../../lib/control-center/trials';
import { requestTrial } from './actions';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

const statusTone: Record<string, string> = {
  requested: 'bg-slate-100 text-slate-600',
  under_review: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-amber-100 text-amber-700',
  converted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

function StatusPill({ value }: Readonly<{ value: string }>) {
  const tone = statusTone[value] ?? 'bg-slate-100 text-slate-500';
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${tone}`}>{value.replace('_', ' ')}</span>;
}

const statusFilters = ['requested', 'under_review', 'active', 'expired', 'converted', 'rejected'];

export default async function ControlCenterTrialsPage({ searchParams }: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
  const { status } = await searchParams;
  const [trials, organizations, products] = await Promise.all([listTrialDirectory(status), listOrganizationOptions(), listProductOptions()]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Trials</h1>
      <p className="mt-2 text-sm text-slate-600">Requested, in review, active, and closed-out trials — every request starts here.</p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Log a trial request</h2>
        <form action={requestTrial} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Organization</span>
            <select name="organizationId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Product</span>
            <select name="productId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {products.map((product) => <option key={product.id} value={product.id}>{product.slug}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Contact person</span>
            <input type="text" name="contactPerson" maxLength={120} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Contact email</span>
            <input type="email" name="contactEmail" maxLength={320} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Contact mobile</span>
            <input type="text" name="contactMobile" maxLength={20} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="flex items-end">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              Log request
            </button>
          </div>
        </form>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/control-center/trials"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${!status ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          All
        </Link>
        {statusFilters.map((entry) => (
          <Link
            key={entry}
            href={`/control-center/trials?status=${entry}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${status === entry ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            {entry.replace('_', ' ')}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Ends</th>
              <th className="px-4 py-3">Requested</th>
            </tr>
          </thead>
          <tbody>
            {trials.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No trials match this filter.</td>
              </tr>
            ) : (
              trials.map((trial) => (
                <tr key={trial.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/control-center/trials/${trial.id}`} className="font-semibold text-slate-900 hover:text-blue-700">
                      {trial.organizationName}
                    </Link>
                    <p className="text-xs text-slate-400">{trial.contactPerson ?? 'No contact on file'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{trial.productSlug}</td>
                  <td className="px-4 py-3"><StatusPill value={trial.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(trial.startedAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(trial.endsAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(trial.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
