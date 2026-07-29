import { requireSessionContext } from '../../../lib/auth/dal';

export default async function SettingsPage() {
  const { user, organization, role, mode } = await requireSessionContext();

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Workspace</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Your organization and account details.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Organization</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Name</dt><dd className="font-medium text-slate-950">{organization.name}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Slug</dt><dd className="font-medium text-slate-950">{organization.slug}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Your account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-950">{user.email}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Role</dt><dd className="font-medium capitalize text-slate-950">{role}</dd></div>
            {mode === 'demo' && <div className="flex justify-between gap-3"><dt className="text-slate-500">Mode</dt><dd className="font-medium text-slate-950">Demo</dd></div>}
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">Coming soon</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Team member invitations, role management, and notification preferences are on the roadmap. They aren&apos;t available yet.
        </p>
      </section>
    </div>
  );
}
