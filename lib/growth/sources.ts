import { ingestOpportunity } from './registry';
import type { IngestResult } from './registry';
import type { Platform, RawOpportunityInput } from './types';

/**
 * The one seam between the Opportunity Registry and wherever discussions
 * actually come from -- "keep platform integrations modular, do not
 * hardcode platform-specific behavior into the core engine." No source in
 * this milestone talks to a real external platform: no LinkedIn, X,
 * Reddit, YouTube, Facebook, or Quora API credentials are configured
 * anywhere in this app, and none are added here. ManualOpportunitySource
 * below is the one real, working implementation -- a marketing team
 * member records a discussion they found. A future platform-specific
 * source (e.g. a Reddit client using Reddit's official, permitted API)
 * implements this exact interface and is registered the same way,
 * without any change to the registry, classification, duplicate
 * prevention, or approval logic.
 */
export interface OpportunitySourceProvider {
  id: string;
  platform: Platform;
  /** Pulls whatever new raw opportunities this source currently has and
   * clears its own queue. A real platform source would poll an API or
   * receive a webhook here instead. */
  fetchOpportunities(): Promise<RawOpportunityInput[]>;
}

export class ManualOpportunitySource implements OpportunitySourceProvider {
  readonly id = 'manual';
  readonly platform: Platform;
  private queue: RawOpportunityInput[] = [];

  constructor(platform: Platform = 'manual') {
    this.platform = platform;
  }

  /** A human records a discussion they found -- this is the entire
   * "monitoring" mechanism this milestone implements: a person, not a
   * scraper. */
  submit(input: Omit<RawOpportunityInput, 'platform'> & { platform?: Platform }): void {
    this.queue.push({ ...input, platform: input.platform ?? this.platform });
  }

  async fetchOpportunities(): Promise<RawOpportunityInput[]> {
    const pending = this.queue;
    this.queue = [];
    return pending;
  }
}

export const manualOpportunitySource = new ManualOpportunitySource();

/** What a scheduler (or, today, a human via manualOpportunitySource.submit)
 * triggers: pull from every given source and ingest the results. */
export async function pollOpportunitySources(sources: OpportunitySourceProvider[] = [manualOpportunitySource]): Promise<IngestResult[]> {
  const results: IngestResult[] = [];
  for (const source of sources) {
    const raw = await source.fetchOpportunities();
    for (const input of raw) {
      results.push(ingestOpportunity(input));
    }
  }
  return results;
}
