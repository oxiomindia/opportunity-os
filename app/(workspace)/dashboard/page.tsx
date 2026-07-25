import Link from 'next/link';
import { navigationItems } from '../../components/workspaceNavigation';

const quickLinks = navigationItems.filter((item) => item.href !== '/dashboard');

export default function DashboardPage() {
  return (
    <div className="flex h-full min-h-[calc(100vh-5.5rem)] flex-col gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">Welcome to Oxiom</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Use this workspace to manage invoice intake, verification, accounts review, payment preparation, reporting, and settings from one operational command center.
        </p>
      </section>

      <section aria-labelledby="quick-navigation-title" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <h2 id="quick-navigation-title" className="sr-only">
          Quick navigation
        </h2>
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-200"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-sm text-slate-600" aria-hidden="true">
                {item.icon}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-950">{item.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
