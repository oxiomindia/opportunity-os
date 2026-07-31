import { randomUUID } from 'node:crypto';
import { listClicks, listConversions, recordConversion } from '../growth/tracking';
import type { ConversionStage } from '../growth/types';
import type { Campaign, CampaignMetrics, RegisterCampaignInput } from './types';

/**
 * Campaign Tracking: the Campaign Registry itself is new (name, source,
 * medium, UTM, landing page), but its metrics are NOT a second counter --
 * computeCampaignMetrics reads the existing click/conversion ledger
 * lib/growth/tracking.ts already maintains (built for the Growth
 * Intelligence Platform milestone) and filters it by utmCampaign. "Reuse
 * existing tracking where appropriate" means this, literally: one ledger,
 * read two ways.
 */
const campaigns = new Map<string, Campaign>();

export function registerCampaign(input: RegisterCampaignInput): Campaign {
  const campaign: Campaign = {
    id: randomUUID(),
    name: input.name,
    source: input.source,
    medium: input.medium,
    utmCampaign: input.utmCampaign,
    landingPageUrl: input.landingPageUrl,
    createdAt: new Date().toISOString(),
  };
  campaigns.set(campaign.id, campaign);
  return campaign;
}

export function listCampaigns(): Campaign[] {
  return Array.from(campaigns.values());
}

export function getCampaign(id: string): Campaign | undefined {
  return campaigns.get(id);
}

/** Records a conversion attributed to a campaign's utm_campaign value --
 * a thin wrapper around lib/growth/tracking.ts's recordConversion that
 * fixes the metadata shape computeCampaignMetrics filters on, so every
 * caller attributes consistently instead of needing to remember the
 * exact metadata key. */
export function recordCampaignConversion(utmCampaign: string, stage: ConversionStage, opportunityId?: string): void {
  recordConversion(stage, opportunityId, { utmCampaign });
}

/** Clicks/leads/trials/customers attributed to this campaign's
 * utm_campaign value, derived live from lib/growth/tracking.ts's ledger
 * -- "leads" maps to the 'website-visit'->'signup' distinction: a signup
 * is what this platform counts as a lead becoming known, not just a
 * click. */
export function computeCampaignMetrics(utmCampaign: string): CampaignMetrics {
  const clicks = listClicks().filter((click) => click.utmCampaign === utmCampaign).length;
  const conversions = listConversions().filter((conversion) => conversion.metadata?.utmCampaign === utmCampaign);
  return {
    clicks,
    leads: conversions.filter((conversion) => conversion.stage === 'signup').length,
    trials: conversions.filter((conversion) => conversion.stage === 'trial').length,
    customers: conversions.filter((conversion) => conversion.stage === 'paid-customer').length,
  };
}

/** Test-only: not intended for production use. */
export function clearCampaignsForTests(): void {
  campaigns.clear();
}
