import { randomUUID } from 'node:crypto';
import { classifyOpportunity, extractKeywords, scoreOpportunityPriority } from './classification';
import type { Opportunity, OpportunityId, OpportunityStatus, RawOpportunityInput } from './types';

/**
 * The Opportunity Registry: a single in-process map, mirroring
 * lib/engine/registry.ts, lib/urp/registry.ts, and
 * lib/webhooks/registry.ts. Not database-backed in this milestone, for
 * the same reason those three aren't: prove the mechanism before adding
 * persistence (see README).
 *
 * Deduplication happens here, at ingestion: the same (platform, threadId)
 * pair ingested twice returns the existing Opportunity rather than
 * creating a second one -- this is Thread Memory, the first of the
 * mandated duplicate-prevention mechanisms (see lib/growth/duplicates.ts
 * for the other two).
 */
const opportunities = new Map<OpportunityId, Opportunity>();
const byThreadKey = new Map<string, OpportunityId>();

function threadKey(platform: string, threadId: string): string {
  return `${platform}:${threadId}`;
}

export interface IngestResult {
  opportunity: Opportunity;
  /** true when this exact (platform, threadId) pair was already known --
   * the registry returned the existing Opportunity instead of creating a
   * duplicate. */
  wasAlreadyKnown: boolean;
}

export function ingestOpportunity(input: RawOpportunityInput): IngestResult {
  const threadId = input.threadId ?? input.sourceUrl;
  const key = threadKey(input.platform, threadId);
  const existingId = byThreadKey.get(key);
  if (existingId) {
    return { opportunity: opportunities.get(existingId)!, wasAlreadyKnown: true };
  }

  const keywords = extractKeywords(input.snippet);
  const category = classifyOpportunity(input.snippet);
  const opportunity: Opportunity = {
    id: randomUUID(),
    platform: input.platform,
    sourceUrl: input.sourceUrl,
    threadId,
    authorHandle: input.authorHandle,
    snippet: input.snippet,
    keywords,
    category,
    priorityScore: scoreOpportunityPriority({ category, keywords, snippet: input.snippet }),
    status: 'new',
    discoveredAt: new Date().toISOString(),
  };
  opportunities.set(opportunity.id, opportunity);
  byThreadKey.set(key, opportunity.id);
  return { opportunity, wasAlreadyKnown: false };
}

/** Highest priority first -- what the Opportunity Queue renders. */
export function listOpportunities(): Opportunity[] {
  return Array.from(opportunities.values()).sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getOpportunity(id: OpportunityId): Opportunity | undefined {
  return opportunities.get(id);
}

export function updateOpportunityStatus(id: OpportunityId, status: OpportunityStatus): Opportunity | undefined {
  const opportunity = opportunities.get(id);
  if (!opportunity) return undefined;
  opportunity.status = status;
  return opportunity;
}

/** Thread Memory read side: has this exact thread already resulted in a
 * published reply? Used by duplicates.ts to warn before a second reply is
 * even drafted. */
export function isThreadAlreadyHandled(platform: string, threadId: string): boolean {
  const id = byThreadKey.get(threadKey(platform, threadId));
  const opportunity = id ? opportunities.get(id) : undefined;
  return opportunity?.status === 'published';
}

/** Test-only: not intended for production use. */
export function clearRegistryForTests(): void {
  opportunities.clear();
  byThreadKey.clear();
}
