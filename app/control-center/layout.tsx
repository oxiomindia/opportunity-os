import type { Metadata } from 'next';
import { requireControlCenterAccess } from '../../lib/control-center/auth';
import ControlCenterShell from './ControlCenterShell';

export const metadata: Metadata = {
  title: 'Control Center | Oxiom',
  robots: { index: false, follow: false },
};

export default async function ControlCenterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireControlCenterAccess();
  return (
    <ControlCenterShell userEmail={admin.user.email} role={admin.role}>
      {children}
    </ControlCenterShell>
  );
}
