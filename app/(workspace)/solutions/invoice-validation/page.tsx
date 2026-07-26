import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('invoice-validation');

export default function InvoiceValidationPage() {
  return <SolutionPageTemplate slug="invoice-validation" />;
}
