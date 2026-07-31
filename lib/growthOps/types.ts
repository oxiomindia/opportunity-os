/**
 * Growth Operations -- shared contract types for the Landing Page
 * Registry, Content Registry, and Campaign Tracking. See
 * lib/growthOps/README.md.
 */

export type PublishStatus = 'draft' | 'review' | 'published';

export interface LandingPageEntry {
  id: string;
  url: string;
  industry: string;
  targetKeyword: string;
  publishStatus: PublishStatus;
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  lastUpdated: string;
}

export interface RegisterLandingPageInput {
  url: string;
  industry: string;
  targetKeyword: string;
  metaTitle: string;
  metaDescription: string;
  canonical?: string;
  publishStatus?: PublishStatus;
}

export type ContentType = 'blog' | 'guide' | 'faq' | 'case-study';

export interface ContentEntry {
  id: string;
  type: ContentType;
  title: string;
  url?: string;
  status: PublishStatus;
  lastUpdated: string;
}

export interface RegisterContentInput {
  type: ContentType;
  title: string;
  url?: string;
  status?: PublishStatus;
}

export interface Campaign {
  id: string;
  name: string;
  source: string;
  medium: string;
  utmCampaign: string;
  landingPageUrl?: string;
  createdAt: string;
}

export interface RegisterCampaignInput {
  name: string;
  source: string;
  medium: string;
  utmCampaign: string;
  landingPageUrl?: string;
}

/** Derived, not stored -- see campaignTracking.ts:computeCampaignMetrics,
 * which reuses lib/growth/tracking.ts's click/conversion ledger rather
 * than maintaining a second, separate counter that could drift from it. */
export interface CampaignMetrics {
  clicks: number;
  leads: number;
  trials: number;
  customers: number;
}
