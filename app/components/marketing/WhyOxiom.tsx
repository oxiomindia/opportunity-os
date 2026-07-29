import { LayersStackIcon, GaugeIcon, ShieldIcon } from './icons';

const pillars = [
  {
    icon: LayersStackIcon,
    title: 'One platform, many products',
    description: 'Every Oxiom product shares the same secure workspace, the same account, and the same design — so your team never has to relearn a new tool.',
  },
  {
    icon: GaugeIcon,
    title: 'Built for how finance actually works',
    description: 'Real approval workflows, real audit trails, real status tracking — not a spreadsheet with a nicer interface.',
  },
  {
    icon: ShieldIcon,
    title: 'Secure by design',
    description: 'Every workspace is isolated by organization, every action is tracked, and every product is built on the same security foundation from day one.',
  },
];

export default function WhyOxiom() {
  return (
    <section aria-labelledby="why-oxiom-title" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-700">Why Oxiom</p>
          <h2 id="why-oxiom-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            A platform designed to grow with your business
          </h2>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <article key={title}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
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
