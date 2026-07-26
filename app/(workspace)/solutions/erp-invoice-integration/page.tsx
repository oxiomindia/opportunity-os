import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('erp-invoice-integration');

export default function ErpInvoiceIntegrationPage() {
  return <SolutionPageTemplate slug="erp-invoice-integration" />;
}
