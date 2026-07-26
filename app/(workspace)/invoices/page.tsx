import { listInvoices } from '../../../lib/invoices/repository';
import InvoicesPageClient from './InvoicesPageClient';

export default async function InvoicesPage() {
  return <InvoicesPageClient invoices={await listInvoices()} />;
}
