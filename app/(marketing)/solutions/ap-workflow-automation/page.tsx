import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('ap-workflow-automation');

export default function ApWorkflowAutomationPage() {
  return <SolutionPageTemplate slug="ap-workflow-automation" />;
}
