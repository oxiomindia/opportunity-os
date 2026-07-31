import { randomUUID } from 'node:crypto';
import { eventBus } from '../events/bus';
import { getDuplicateWarnings, recordUserEngagement } from './duplicates';
import { getOpportunity, updateOpportunityStatus } from './registry';
import { templateReplyAssistant } from './replyAssistant';
import type { ReplyAssistantProvider } from './replyAssistant';
import { isEligibleForApproval, QUALITY_THRESHOLD, scoreReplyQuality } from './qualityScoring';
import type { DraftReply, DraftReplyId, OpportunityId, PublishedEngagement } from './types';

/**
 * The approval workflow. Structured the same way URP's generation
 * pipeline is: one function per pipeline stage, and a Result at the end.
 *
 * The safety guarantee this milestone is built around is structural, not
 * a policy someone could forget: there is no function anywhere in this
 * module -- or anywhere in lib/growth/ -- that calls an external
 * platform's posting API. recordPublication only records that a human
 * already posted a reply themselves, at a URL they supply. "The system
 * must not automatically publish replies" is true because the code to do
 * that does not exist, not because something is disabled.
 */

const drafts = new Map<DraftReplyId, DraftReply>();
const publishedEngagements: PublishedEngagement[] = [];
/** Approved reply bodies, per platform -- feeds the lexical-similarity
 * duplicate check for the next draft on the same platform. */
const approvedBodiesByPlatform = new Map<string, string[]>();

export interface SubmitDraftOptions {
  assistant?: ReplyAssistantProvider;
}

export async function submitDraftForReview(opportunityId: OpportunityId, options: SubmitDraftOptions = {}): Promise<DraftReply> {
  const opportunity = getOpportunity(opportunityId);
  if (!opportunity) throw new Error(`Opportunity "${opportunityId}" was not found.`);

  const assistant = options.assistant ?? templateReplyAssistant;
  const content = await assistant.generateDraft(opportunity);

  const approvedBodies = approvedBodiesByPlatform.get(opportunity.platform) ?? [];
  const duplicateWarnings = getDuplicateWarnings({
    platform: opportunity.platform,
    threadId: opportunity.threadId,
    authorHandle: opportunity.authorHandle,
    candidateReplyBody: content.body,
    approvedReplyBodies: approvedBodies,
  });

  const quality = scoreReplyQuality(content, opportunity, duplicateWarnings);

  const draft: DraftReply = {
    id: randomUUID(),
    opportunityId,
    body: content.body,
    includesLink: content.includesLink,
    linkRationale: content.linkRationale,
    suggestedDocs: content.suggestedDocs,
    generatedBy: assistant.id,
    duplicateWarnings,
    quality,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  drafts.set(draft.id, draft);
  updateOpportunityStatus(opportunityId, 'drafted');
  return draft;
}

export function listDrafts(): DraftReply[] {
  return Array.from(drafts.values());
}

export function getDraft(id: DraftReplyId): DraftReply | undefined {
  return drafts.get(id);
}

/**
 * A human approves a draft. Hard guard: a draft scoring below
 * QUALITY_THRESHOLD cannot be approved regardless of who reviews it --
 * "replies below the configured quality threshold must not be published"
 * is enforced here, before publication is even possible, not left to the
 * reviewer's judgment alone.
 */
export function approveDraft(id: DraftReplyId, reviewer: string, notes?: string): DraftReply {
  const draft = requireDraft(id);
  if (!isEligibleForApproval(draft.quality)) {
    throw new Error(`Draft "${id}" scored ${draft.quality.overall}, below the quality threshold of ${QUALITY_THRESHOLD}, and cannot be approved.`);
  }

  draft.status = 'approved';
  draft.reviewedBy = reviewer;
  draft.reviewedAt = new Date().toISOString();
  draft.reviewNotes = notes;

  const opportunity = getOpportunity(draft.opportunityId);
  if (opportunity) {
    updateOpportunityStatus(opportunity.id, 'approved');
    const approvedBodies = approvedBodiesByPlatform.get(opportunity.platform) ?? [];
    approvedBodies.push(draft.body);
    approvedBodiesByPlatform.set(opportunity.platform, approvedBodies);
  }
  return draft;
}

export function rejectDraft(id: DraftReplyId, reviewer: string, notes?: string): DraftReply {
  const draft = requireDraft(id);
  draft.status = 'rejected';
  draft.reviewedBy = reviewer;
  draft.reviewedAt = new Date().toISOString();
  draft.reviewNotes = notes;
  return draft;
}

/**
 * Records that a human already published this reply themselves --
 * publishedUrl must point at where they actually posted it. Requires
 * 'approved' status: a draft that was rejected, or never reviewed, can
 * never be recorded as published.
 */
export async function recordPublication(draftId: DraftReplyId, publishedUrl: string, publishedBy: string): Promise<PublishedEngagement> {
  const draft = requireDraft(draftId);
  if (draft.status !== 'approved') {
    throw new Error(`Draft "${draftId}" must be approved before a publication can be recorded (current status: "${draft.status}").`);
  }
  draft.status = 'published';

  const opportunity = getOpportunity(draft.opportunityId);
  if (opportunity) {
    updateOpportunityStatus(opportunity.id, 'published');
    recordUserEngagement(opportunity.authorHandle, opportunity.platform);
  }

  const engagement: PublishedEngagement = {
    id: randomUUID(),
    opportunityId: draft.opportunityId,
    draftId: draft.id,
    publishedUrl,
    publishedBy,
    publishedAt: new Date().toISOString(),
    // buildUtmLink (lib/growth/tracking.ts) is what actually appends UTM
    // params before a human copies a link into their reply; this field
    // records the URL as published.
    utmLink: publishedUrl,
  };
  publishedEngagements.push(engagement);

  await eventBus.publish({
    eventName: 'growth.engagement-published',
    sourceEngine: 'growth-intelligence',
    payload: { opportunityId: draft.opportunityId, draftId: draft.id, platform: opportunity?.platform },
  });

  return engagement;
}

export function listPublishedEngagements(): PublishedEngagement[] {
  return [...publishedEngagements];
}

function requireDraft(id: DraftReplyId): DraftReply {
  const draft = drafts.get(id);
  if (!draft) throw new Error(`Draft "${id}" was not found.`);
  return draft;
}

/** Test-only: not intended for production use. */
export function clearApprovalStateForTests(): void {
  drafts.clear();
  publishedEngagements.length = 0;
  approvedBodiesByPlatform.clear();
}
