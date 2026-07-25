import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('enterprise-workflow-automation');

export default function EnterpriseWorkflowAutomationPage() {
  return <SolutionPageTemplate slug="enterprise-workflow-automation" />;
}
