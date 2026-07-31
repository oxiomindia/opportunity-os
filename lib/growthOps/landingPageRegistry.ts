import { randomUUID } from 'node:crypto';
import type { LandingPageEntry, PublishStatus, RegisterLandingPageInput } from './types';

/**
 * The Landing Page Registry: a single in-process map, mirroring every
 * other registry this platform has built (Engine, Report, Webhook,
 * Growth Intelligence's Opportunity Registry). Not database-backed --
 * prove the mechanism first, same reasoning as those.
 */
const pages = new Map<string, LandingPageEntry>();

export function registerLandingPage(input: RegisterLandingPageInput): LandingPageEntry {
  const now = new Date().toISOString();
  const entry: LandingPageEntry = {
    id: randomUUID(),
    url: input.url,
    industry: input.industry,
    targetKeyword: input.targetKeyword,
    publishStatus: input.publishStatus ?? 'draft',
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    canonical: input.canonical ?? input.url,
    lastUpdated: now,
  };
  pages.set(entry.id, entry);
  return entry;
}

export function listLandingPages(): LandingPageEntry[] {
  return Array.from(pages.values());
}

export function getLandingPage(id: string): LandingPageEntry | undefined {
  return pages.get(id);
}

export function updateLandingPageStatus(id: string, status: PublishStatus): LandingPageEntry | undefined {
  const entry = pages.get(id);
  if (!entry) return undefined;
  entry.publishStatus = status;
  entry.lastUpdated = new Date().toISOString();
  return entry;
}

/** Test-only: not intended for production use. */
export function clearLandingPageRegistryForTests(): void {
  pages.clear();
}
