import { LayersStackIcon, GaugeIcon, ShieldIcon } from './icons';

const workflow = ['Automate', 'Approve', 'Track', 'Reconcile', 'Report'];

const pillars = [
  {
    icon: LayersStackIcon,
    title: 'One platform, many products',
    description: 'Every Oxiom product shares the same secure workspace and the same account, so teams can add workflows without relearning the system.',
  },
  {
    icon: GaugeIcon,
    title: 'Built for how finance actually works',
    description: 'Approval workflows, audit trails, status tracking, and reporting are treated as core finance operations, not afterthoughts.',
  },
  {
    icon: ShieldIcon,
    title: 'Secure by design',
    description: 'Every workspace is isolated by organization, every action is tracked, and every product is built on the same security foundation.',
  },
];

export default function WhyOxiom() {
  return (
    <section aria-labelledby="why-oxiom-title" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-700">Why Oxiom</p>
            <h2 id="why-oxiom-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Finance work needs a path, not another pile of cards
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
                <p className="text-xs font-semibold text-slate-400">0{index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
