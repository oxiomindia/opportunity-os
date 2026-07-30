import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('accounts-payable-automation');

export default function AccountsPayableAutomationPage() {
  return <SolutionPageTemplate slug="accounts-payable-automation" />;
}
