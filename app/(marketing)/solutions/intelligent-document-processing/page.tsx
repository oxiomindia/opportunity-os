import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('intelligent-document-processing');

export default function IntelligentDocumentProcessingPage() {
  return <SolutionPageTemplate slug="intelligent-document-processing" />;
}
