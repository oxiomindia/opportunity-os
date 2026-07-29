import { ClockIcon, UsersIcon, CheckIcon, ShieldIcon } from './icons';

const reasons = [
  {
    icon: ClockIcon,
    title: 'Faster close, less manual work',
    description: 'Replace spreadsheets and email threads with structured workflows that move invoices and bills forward automatically.',
  },
  {
    icon: UsersIcon,
    title: 'Built for the whole finance team',
    description: 'Role-based approvals mean the right person reviews the right thing — without slowing everyone else down.',
  },
  {
    icon: CheckIcon,
    title: 'Nothing falls through the cracks',
    description: 'Every invoice and bill has a clear status, a clear owner, and a full history of what happened and when.',
  },
  {
    icon: ShieldIcon,
    title: 'Audit-ready from day one',
    description: 'Every status change and payment is logged automatically, so you are always ready for a review.',
  },
];

export default function WhyChooseOxiom() {
  return (
    <section aria-labelledby="why-choose-title" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-700">Why businesses choose Oxiom</p>
          <h2 id="why-choose-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            The outcomes that matter to finance leaders
          </h2>
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {reasons.map(({ icon: Icon, title, description }) => (
            <article key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-slate-200">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
