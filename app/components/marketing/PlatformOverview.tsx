import Link from 'next/link';
import { controlCenterModules } from '../../../lib/control-center/navigation';
import { GlobeIcon, LayersStackIcon, SlidersIcon, ArrowRightIcon } from './icons';

const publicWebsiteSections = ['About', 'Features', 'Pricing', 'Documentation', 'Contact', 'Legal', 'Blog (Future)'];
const workspaceCapabilities = ['Dashboard', 'Accounts Payable', 'Accounts Receivable', 'Vendors', 'Customers', 'Bills', 'Invoices', 'Reports'];

function BulletList({ items }: Readonly<{ items: string[] }>) {
  return (
    <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5">
          <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
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
    <section aria-labelledby="platform-overview-title" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-700">How Oxiom is built</p>
          <h2 id="platform-overview-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            One platform, three parts
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Everything in Oxiom lives in one of three places — see where you are, and where you&apos;re going.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <GlobeIcon size={24} />
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">Public Website</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Marketing and customer acquisition — where prospective customers discover Oxiom, explore products, and request a trial.
            </p>
            <BulletList items={publicWebsiteSections} />
            <Link
              href="/platform"
              className="mt-7 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Explore Oxiom
              <ArrowRightIcon size={14} />
            </Link>
          </article>

          <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <LayersStackIcon size={24} />
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">Customer Workspace</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The operational platform your team uses after login — Accounts Payable, Accounts Receivable, and reporting in one place.
            </p>
            <BulletList items={workspaceCapabilities} />
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 ring-1 ring-amber-100">Coming soon</span>
              AI capabilities
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Go to Workspace
              <ArrowRightIcon size={14} />
            </Link>
          </article>

          <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                <SlidersIcon size={24} />
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Owner access</span>
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">Oxiom Control Center</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Owner administration and commercial management — the control plane behind every Oxiom product.
            </p>
            <div className="mt-5 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Completed modules</p>
              <BulletList items={completedModules} />
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Upcoming modules</p>
              <BulletList items={upcomingModules} />
            </div>
            <Link
              href="/control-center"
              className="mt-7 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Control Center
              <ArrowRightIcon size={14} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
