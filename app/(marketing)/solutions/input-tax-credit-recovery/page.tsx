import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('input-tax-credit-recovery');

export default function InputTaxCreditRecoveryPage() {
  return <SolutionPageTemplate slug="input-tax-credit-recovery" />;
}
