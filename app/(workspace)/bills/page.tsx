import { listVendorInvoices } from '../../../lib/vendorInvoices/repository';
import BillsPageClient from './BillsPageClient';

export const metadata = {
  title: 'Bills | Oxiom',
  description: 'Review, approve, and pay the vendor invoices your organization owes.',
};

export default async function BillsPage() {
  return <BillsPageClient bills={await listVendorInvoices()} />;
}
