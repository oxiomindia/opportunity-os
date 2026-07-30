import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('invoice-approval-workflow');

export default function InvoiceApprovalWorkflowPage() {
  return <SolutionPageTemplate slug="invoice-approval-workflow" />;
}
