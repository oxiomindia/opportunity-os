import Link from 'next/link';

export default function OrganizationRequiredPage() {
  return <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center"><section className="w-full rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
    <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Organization required</p>
    <h1 className="mt-2 text-3xl font-semibold text-slate-950">Create an organization to continue</h1>
    <p className="mt-4 text-sm leading-6 text-slate-600">This feature works with organization data and cannot be used from a personal workspace. Your dashboard and product resources remain available while you decide when to set up your organization.</p>
    <div className="mt-6 flex flex-wrap gap-3"><Link href="/onboarding" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Create Organization</Link><Link href="/dashboard" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Return to dashboard</Link></div>
  </section></div>;
}
