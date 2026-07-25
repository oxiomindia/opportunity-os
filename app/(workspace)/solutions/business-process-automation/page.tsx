import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('business-process-automation');

export default function BusinessProcessAutomationPage() {
  return <SolutionPageTemplate slug="business-process-automation" />;
}
