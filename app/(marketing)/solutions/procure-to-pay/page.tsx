import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('procure-to-pay');

export default function ProcureToPayPage() {
  return <SolutionPageTemplate slug="procure-to-pay" />;
}
