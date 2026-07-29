'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { controlCenterModules } from '../../lib/control-center/navigation';
import { logout } from '../login/actions';

interface ControlCenterShellProps {
  children: React.ReactNode;
  userEmail: string;
  role: string;
}

export default function ControlCenterShell({ children, userEmail, role }: Readonly<ControlCenterShellProps>) {
  const pathname = usePathname();
  const activeModule = controlCenterModules.find((module) => module.href === pathname);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">O</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Oxiom Control Center</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-3" aria-label="Control Center navigation">
          {controlCenterModules.map((module) => {
            const active = pathname === module.href;
            if (module.status === 'planned') {
              return (
                <div
                  key={module.id}
                  className="flex h-10 items-center justify-between rounded-md px-3 text-sm font-medium text-slate-400"
                  title={`${module.label} — planned for a later checkpoint`}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex w-4 justify-center text-[15px]" aria-hidden="true">{module.icon}</span>
                    {module.label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Planned</span>
                </div>
              );
            }
            return (
              <Link
                key={module.id}
                href={module.href}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <span className="flex w-4 justify-center text-[15px]" aria-hidden="true">{module.icon}</span>
                {module.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <Link href="/dashboard" className="block rounded-md px-3 py-2 text-xs font-semibold text-slate-500 hover:text-blue-700">
            ← Return to workspace
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
          <p className="text-sm font-semibold text-slate-900">{activeModule?.label ?? 'Control Center'}</p>
          <div className="flex items-center gap-3">
            <span className="text-right">
              <span className="block max-w-48 truncate text-xs font-semibold text-slate-800">{userEmail}</span>
              <span className="block text-[11px] capitalize text-slate-500">{role.replace('-', ' ')}</span>
            </span>
            <form action={logout}>
              <button type="submit" className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-auto p-5">{children}</main>
      </div>
    </div>
  );
}
