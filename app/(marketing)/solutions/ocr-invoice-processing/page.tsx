import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('ocr-invoice-processing');

export default function OcrInvoiceProcessingPage() {
  return <SolutionPageTemplate slug="ocr-invoice-processing" />;
}
