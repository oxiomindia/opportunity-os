import AppShell from '../components/AppShell';
import { InvoiceIntakeProvider } from '../components/InvoiceIntakeProvider';

export const metadata = {
  title: 'Oxiom Invoice Processing | Dashboard',
  description: 'Manage vendor invoices and Accounts Payable workflows on the Oxiom One platform.',
};

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <InvoiceIntakeProvider>
      <AppShell>{children}</AppShell>
    </InvoiceIntakeProvider>
  );
}
