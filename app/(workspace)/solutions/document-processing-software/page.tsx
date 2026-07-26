import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('document-processing-software');

export default function DocumentProcessingSoftwarePage() {
  return <SolutionPageTemplate slug="document-processing-software" />;
}
