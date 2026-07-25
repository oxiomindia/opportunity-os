import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('invoice-processing-software');

export default function InvoiceProcessingSoftwarePage() {
  return <SolutionPageTemplate slug="invoice-processing-software" />;
}
