import { mockInvoices } from '../../../data/mockInvoices';
import InvoicesPageClient from './InvoicesPageClient';

export default function InvoicesPage() {
  return <InvoicesPageClient invoices={mockInvoices} />;
}
