import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('invoice-capture');

export default function InvoiceCapturePage() {
  return <SolutionPageTemplate slug="invoice-capture" />;
}
