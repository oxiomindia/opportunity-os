import { randomUUID } from 'node:crypto';
import { absoluteUrl } from '../seo/metadata';
import type { ClickEvent, ConversionEvent, ConversionStage, OpportunityId, PublishedEngagementId } from './types';

/**
 * Click, UTM, and conversion tracking. In-process only, like every other
 * registry in this module -- see README. absoluteUrl/SITE_URL are reused
 * from lib/seo/metadata.ts rather than a second hardcoded production
 * domain constant.
 */

const clicks: ClickEvent[] = [];
const conversions: ConversionEvent[] = [];

const UTM_SOURCE = 'oxiom-growth';

/** destinationPath is a site-relative path (e.g. '/solutions/input-tax-credit-recovery');
 * resolved against the real production origin via absoluteUrl so the link
 * a human copies into a reply is a genuine, working URL. */
export function buildUtmLink(destinationPath: string, campaign: string, medium: string = 'social'): string {
  const url = new URL(absoluteUrl(destinationPath));
  url.searchParams.set('utm_source', UTM_SOURCE);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  return url.toString();
}

export interface RecordClickInput {
  destinationUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  publishedEngagementId?: PublishedEngagementId;
  opportunityId?: OpportunityId;
}

export function recordClick(input: RecordClickInput): ClickEvent {
  const click: ClickEvent = { id: randomUUID(), clickedAt: new Date().toISOString(), ...input };
  clicks.push(click);
  return click;
}

export function recordConversion(stage: ConversionStage, opportunityId?: OpportunityId, metadata?: Record<string, unknown>): ConversionEvent {
  const conversion: ConversionEvent = { id: randomUUID(), stage, opportunityId, occurredAt: new Date().toISOString(), metadata };
  conversions.push(conversion);
  return conversion;
}

export function listClicks(): ClickEvent[] {
  return [...clicks];
}

export function listConversions(): ConversionEvent[] {
  return [...conversions];
}

export interface FunnelSummary {
  clicks: number;
  websiteVisits: number;
  signups: number;
  trials: number;
  paidCustomers: number;
}

/** Opportunity -> Reply Suggested -> Reply Approved -> Reply Published ->
 * Website Visit -> Signup -> Trial -> Paid Customer -- the first four
 * stages are opportunity/draft status (see registry.ts/approval.ts); this
 * covers the last four, the ones this module tracks directly. No engine
 * anywhere in this codebase publishes 'signup'/'trial'/'paid-customer'
 * events yet (see README) -- recordConversion is the function a future
 * integration calls once one does. */
export function computeFunnelSummary(): FunnelSummary {
  const countStage = (stage: ConversionStage) => conversions.filter((conversion) => conversion.stage === stage).length;
  return {
    clicks: clicks.length,
    websiteVisits: countStage('website-visit'),
    signups: countStage('signup'),
    trials: countStage('trial'),
    paidCustomers: countStage('paid-customer'),
  };
}

/** Test-only: not intended for production use. */
export function clearTrackingStateForTests(): void {
  clicks.length = 0;
  conversions.length = 0;
}
