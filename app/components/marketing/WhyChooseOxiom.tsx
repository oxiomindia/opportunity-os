import { ClockIcon, UsersIcon, CheckIcon, ShieldIcon } from './icons';

const reasons = [
  {
    icon: ClockIcon,
    title: 'Faster close, less manual work',
    description: 'Replace spreadsheets and email threads with structured workflows that move invoices and bills forward.',
  },
  {
    icon: CheckIcon,
    title: 'Nothing falls through the cracks',
    description: 'Every invoice and bill has a clear status, a clear owner, and a full history of what happened and when.',
  },
  {
    icon: UsersIcon,
    title: 'Built for the whole finance team',
    description: 'Role-based approvals help the right person review the right thing without slowing everyone else down.',
  },
  {
    icon: ShieldIcon,
    title: 'Audit-ready from day one',
    description: 'Status changes and payment activity are logged automatically, so finance teams have a stronger record for review.',
  },
];

export default function WhyChooseOxiom() {
  return (
    <section aria-labelledby="why-choose-title" className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold text-blue-700">Business outcomes</p>
            <h2 id="why-choose-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Close faster. Collect faster. Know where every rupee went.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
