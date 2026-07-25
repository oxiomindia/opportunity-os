import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('digital-invoice-processing');

export default function DigitalInvoiceProcessingPage() {
  return <SolutionPageTemplate slug="digital-invoice-processing" />;
}
