import type { Metadata } from 'next';
import { requireControlCenterAccess } from '../../lib/control-center/auth';
import { getVisibleModules } from '../../lib/control-center/navigation';
import ControlCenterShell from './ControlCenterShell';

export const metadata: Metadata = {
  title: 'Oxiom Control Center',
  description: 'Oxiom Control Center — the Owner administration area for the Oxiom platform.',
  robots: { index: false, follow: false },
};

export default async function ControlCenterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireControlCenterAccess();
  const modules = getVisibleModules(admin.role);
  return (
    <ControlCenterShell userEmail={admin.user.email} role={admin.role} modules={modules}>
      {children}
    </ControlCenterShell>
  );
}
