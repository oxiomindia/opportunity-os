import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('vendor-invoice-processing');

export default function VendorInvoiceProcessingPage() {
  return <SolutionPageTemplate slug="vendor-invoice-processing" />;
}
