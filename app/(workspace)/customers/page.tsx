import { listCustomers } from '../../../lib/customers/repository';
import CustomersPageClient from './CustomersPageClient';

export const metadata = {
  title: 'Customers | Oxiom',
  description: 'Manage the customers you bill on the Oxiom platform.',
};

export default async function CustomersPage() {
  return <CustomersPageClient customers={await listCustomers()} />;
}
