import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('supplier-invoice-management');

export default function SupplierInvoiceManagementPage() {
  return <SolutionPageTemplate slug="supplier-invoice-management" />;
}
