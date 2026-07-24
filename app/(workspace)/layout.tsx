import AppShell from '../components/AppShell';
import { InvoiceIntakeProvider } from '../components/InvoiceIntakeProvider';

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <InvoiceIntakeProvider>
      <AppShell>{children}</AppShell>
    </InvoiceIntakeProvider>
  );
}
