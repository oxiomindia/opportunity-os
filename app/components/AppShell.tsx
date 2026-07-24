'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { navigationItems } from './workspaceNavigation';

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/invoices/')) return 'Invoice Details';
  if (pathname.startsWith('/extraction/')) return 'Extraction Result';
  if (pathname === '/extraction') return 'Extraction Queue';
  if (pathname === '/upload') return 'Upload Invoices';

  return navigationItems.find((item) => item.href === pathname)?.label ?? 'Dashboard';
}

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950">
      <aside
        className={`flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] ${
          collapsed ? 'w-16' : 'w-16 lg:w-56'
        }`}
      >
        <div className="flex h-14 items-center justify-between px-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2" aria-label="Oxiom dashboard">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-sm font-semibold text-white">
              O
            </span>
            {!collapsed && <span className="hidden truncate text-sm font-semibold tracking-tight lg:block">Oxiom</span>}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-700 lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-2" aria-label="Application navigation">
          {navigationItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
                title={item.label}
              >
                <span className="flex w-4 shrink-0 justify-center text-[15px]" aria-hidden="true">
                  {item.icon}
                </span>
                {!collapsed && <span className="hidden truncate lg:block">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
              O
            </span>
            <h1 className="truncate text-sm font-semibold text-slate-900">{pageTitle}</h1>
          </div>

          <div className="hidden w-full max-w-sm md:block">
            <label className="sr-only" htmlFor="workspace-search">
              Search workspace
            </label>
            <input
              id="workspace-search"
              type="search"
              placeholder="Search"
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-700"
              aria-label="Notifications"
            >
              ○
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700"
              aria-label="Profile"
            >
              OX
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-auto p-4 md:p-5">{children}</main>
      </div>
    </div>
  );
}
