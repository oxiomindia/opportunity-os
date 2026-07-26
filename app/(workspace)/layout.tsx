import AppShell from '../components/AppShell';
import { InvoiceIntakeProvider } from '../components/InvoiceIntakeProvider';
import { requireSessionContext } from '../../lib/auth/dal';

export const metadata = {
  title: 'Oxiom Invoice Processing | Dashboard',
  description: 'Manage vendor invoices and Accounts Payable workflows on the Oxiom One platform.',
};

export default async function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSessionContext();
  return (
    <InvoiceIntakeProvider>
      <AppShell userEmail={session.user.email} organizationName={session.organization.name} role={session.role}>{children}</AppShell>
    </InvoiceIntakeProvider>
  );
}
