import AppShell from '../components/AppShell';
import { InvoiceIntakeProvider } from '../components/InvoiceIntakeProvider';
import { getSessionContext, requireUser } from '../../lib/auth/dal';

export const metadata = {
  title: 'Oxiom Invoice Processing | Dashboard',
  description: 'Manage vendor invoices and Accounts Payable workflows on the Oxiom One platform.',
};

export default async function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const session = await getSessionContext();
  return (
    <InvoiceIntakeProvider>
      <AppShell userEmail={user.email} organizationName={session?.organization.name} role={session?.role}>{children}</AppShell>
    </InvoiceIntakeProvider>
  );
}
