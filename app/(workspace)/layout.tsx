import AppShell from '../components/AppShell';
import { getSessionContext, requireUser } from '../../lib/auth/dal';

export const metadata = {
  title: 'Oxiom Invoice Software | Dashboard',
  description: 'Create, send, and track customer invoices on the Oxiom platform.',
};

export default async function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const session = await getSessionContext();
  return (
    <AppShell userEmail={user.email} organizationName={session?.organization.name} role={session?.role}>{children}</AppShell>
  );
}
