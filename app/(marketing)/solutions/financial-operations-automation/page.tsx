import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('financial-operations-automation');

export default function FinancialOperationsAutomationPage() {
  return <SolutionPageTemplate slug="financial-operations-automation" />;
}
