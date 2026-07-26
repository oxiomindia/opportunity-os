import { Metadata } from 'next';

import { SolutionPageTemplate } from '../SolutionPageTemplate';
import { getSolutionMetadata } from '../solutionContent';

export const metadata: Metadata = getSolutionMetadata('ap-analytics');

export default function ApAnalyticsPage() {
  return <SolutionPageTemplate slug="ap-analytics" />;
}
