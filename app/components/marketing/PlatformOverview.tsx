import Link from 'next/link';
import { controlCenterModules } from '../../../lib/control-center/navigation';
import { GlobeIcon, LayersStackIcon, SlidersIcon, ArrowRightIcon } from './icons';

const publicWebsiteSections = ['About', 'Features', 'Pricing', 'Documentation', 'Contact', 'Legal'];
const workspaceCapabilities = ['Dashboard', 'Accounts Payable', 'Accounts Receivable', 'Vendors', 'Customers', 'Bills', 'Invoices', 'Reports'];

function CapabilityList({ items }: Readonly<{ items: string[] }>) {
  return (
    <ul className="mt-5 grid gap-2 text-sm text-slate-300">
      {items.slice(0, 6).map((item) => (
        <li key={item} className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PlatformOverview() {
  const completedModules = controlCenterModules.filter((module) => module.availability === 'available' && module.id !== 'dashboard').map((module) => module.title);
  const upcomingModules = controlCenterModules.filter((module) => module.availability === 'planned').map((module) => module.title);

  return (
    <section aria-labelledby="platform-overview-title" className="bg-slate-950 py-18 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-cyan-300">How Oxiom works</p>
            <h2 id="platform-overview-title" className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              One platform, three connected parts
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Prospects discover products on the public website, teams run AP and AR in the customer workspace, and Oxiom operators manage the platform through the Control Center.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-400/10 text-blue-200 ring-1 ring-blue-300/20">
              <GlobeIcon size={24} />
            </span>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Discover</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Public Website</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Prospective customers explore Oxiom, compare products, and request a trial.
            </p>
            <CapabilityList items={publicWebsiteSections} />
            <Link href="/platform" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-200 hover:text-cyan-100">
              Explore Oxiom
              <ArrowRightIcon size={14} />
            </Link>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-cyan-300/30 bg-cyan-300/[.08] p-7 shadow-2xl shadow-cyan-950/30">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20">
              <LayersStackIcon size={24} />
            </span>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">Operate</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Customer Workspace</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Finance teams manage payables, receivables, vendors, customers, and reporting after login.
            </p>
            <CapabilityList items={workspaceCapabilities} />
            <p className="mt-4 inline-flex rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-200/20">
              AI capabilities coming soon
            </p>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200 ring-1 ring-violet-300/20">
              <SlidersIcon size={24} />
            </span>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Administer</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Oxiom Control Center</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Owner administration and commercial management sit behind every Oxiom product.
            </p>
            <CapabilityList items={[...completedModules, ...upcomingModules]} />
            <Link href="/control-center" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-200 hover:text-cyan-100">
              Control Center
              <ArrowRightIcon size={14} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
