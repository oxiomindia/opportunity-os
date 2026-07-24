import { mockInvoices } from '../../../data/mockInvoices';
import InvoiceWorklist from './InvoiceWorklist';

export default function InvoicesPage() {
  return <InvoiceWorklist invoices={mockInvoices} />;
}
