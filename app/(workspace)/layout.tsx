import AppShell from '../components/AppShell';
import { getSessionContext, requireUser } from '../../lib/auth/dal';
import { getCurrentEdition } from '../../lib/edition';

export const metadata = {
  title: 'Oxiom Invoice Software | Dashboard',
  description: 'Create, send, and track customer invoices on the Oxiom platform.',
};

export default async function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, session, edition] = await Promise.all([requireUser(), getSessionContext(), getCurrentEdition()]);
  return (
    <AppShell userEmail={user.email} organizationName={session?.organization.name} role={session?.role} edition={edition}>{children}</AppShell>
  );
}
