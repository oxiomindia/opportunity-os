import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('ai-invoice-processing');

export default function AiInvoiceProcessingPage() {
  return <SolutionPageTemplate slug="ai-invoice-processing" />;
}
