import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('invoice-lifecycle-management');

export default function InvoiceLifecycleManagementPage() {
  return <SolutionPageTemplate slug="invoice-lifecycle-management" />;
}
