import type { Metadata } from 'next';
import { requirePlatformAdmin } from '../../lib/feedback/admin';
import { getVisibleModules } from '../../lib/control-center/navigation';
import { NOINDEX } from '../../lib/seo/metadata';
import ControlCenterShell from './ControlCenterShell';

export const metadata: Metadata = {
  title: 'Oxiom Control Center',
  description: 'Oxiom Control Center — the unified platform administration area for Oxiom.',
  robots: NOINDEX,
};

/**
 * The shell now admits any platform admin role (product-admin, security-admin,
 * platform-admin) rather than Owner-only, since /control-center/feedback is
 * open to all three roles -- the same access product feedback administration
 * has always had. Every module that must stay Owner-only (everything except
 * Feedback) enforces that itself by calling requireControlCenterAccess() at
 * the top of its own page -- see lib/control-center/auth.ts.
 */
export default async function ControlCenterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requirePlatformAdmin();
  const modules = getVisibleModules(admin.role);
  return (
    <ControlCenterShell userEmail={admin.user.email} role={admin.role} modules={modules}>
      {children}
    </ControlCenterShell>
  );
}
