import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('finance-process-automation');

export default function FinanceProcessAutomationPage() {
  return <SolutionPageTemplate slug="finance-process-automation" />;
}
