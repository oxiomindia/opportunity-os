import { listVendors } from '../../../lib/vendors/repository';
import VendorsPageClient from './VendorsPageClient';

export const metadata = {
  title: 'Vendors | Oxiom',
  description: 'Manage the vendors you receive and pay invoices from on the Oxiom platform.',
};

export default async function VendorsPage() {
  return <VendorsPageClient vendors={await listVendors()} />;
}
