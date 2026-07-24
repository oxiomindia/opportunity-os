import AppShell from '../components/AppShell';
import { ExtractionProvider } from '../components/ExtractionProvider';
import { InvoiceIntakeProvider } from '../components/InvoiceIntakeProvider';

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <InvoiceIntakeProvider>
      <ExtractionProvider>
        <AppShell>{children}</AppShell>
      </ExtractionProvider>
    </InvoiceIntakeProvider>
  );
}
