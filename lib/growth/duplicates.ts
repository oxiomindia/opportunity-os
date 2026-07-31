import { isThreadAlreadyHandled } from './registry';
import { textSimilarity } from './textSimilarity';
import type { DuplicateWarning } from './types';

/**
 * Duplicate prevention, the three mechanisms the platform brief mandates
 * beyond Thread Memory (which lives in registry.ts, since that's where
 * threads are already tracked):
 *
 * - User Memory: wasUserRecentlyEngaged -- avoid repeatedly replying to
 *   the same person, tracked separately from thread status because the
 *   same person can appear across many different threads.
 * - Semantic Similarity (lexical heuristic -- see textSimilarity.ts):
 *   flags a candidate reply that reuses a lot of the same wording as a
 *   reply that was already approved on the same platform.
 * - getDuplicateWarnings combines all three (plus Thread Memory) into the
 *   warning list a human reviews before approving a draft.
 */

const SIMILARITY_WARNING_THRESHOLD = 0.6;
const RECENT_USER_ENGAGEMENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface UserEngagementRecord {
  authorHandle: string;
  platform: string;
  engagedAtMs: number;
}

const userEngagementLog: UserEngagementRecord[] = [];

/** Called once a reply is actually published for a given opportunity's
 * author -- see approval.ts:recordPublication. */
export function recordUserEngagement(authorHandle: string, platform: string, now: number = Date.now()): void {
  userEngagementLog.push({ authorHandle, platform, engagedAtMs: now });
}

export function wasUserRecentlyEngaged(authorHandle: string, platform: string, now: number = Date.now()): boolean {
  return userEngagementLog.some(
    (record) => record.authorHandle === authorHandle && record.platform === platform && now - record.engagedAtMs < RECENT_USER_ENGAGEMENT_WINDOW_MS
  );
}

export interface DuplicateCheckInput {
  platform: string;
  threadId: string;
  authorHandle: string;
  candidateReplyBody: string;
  /** Bodies of replies already approved on this platform, to check the
   * candidate against for lexical similarity. */
  approvedReplyBodies: readonly string[];
}

export function getDuplicateWarnings(input: DuplicateCheckInput): DuplicateWarning[] {
  const warnings: DuplicateWarning[] = [];

  if (isThreadAlreadyHandled(input.platform, input.threadId)) {
    warnings.push({ type: 'thread-already-handled', detail: `A reply has already been published in thread "${input.threadId}".` });
  }

  if (wasUserRecentlyEngaged(input.authorHandle, input.platform)) {
    warnings.push({ type: 'user-recently-engaged', detail: `${input.authorHandle} on ${input.platform} was engaged with in the last 7 days.` });
  }

  for (const approved of input.approvedReplyBodies) {
    const similarity = textSimilarity(input.candidateReplyBody, approved);
    if (similarity >= SIMILARITY_WARNING_THRESHOLD) {
      warnings.push({ type: 'similar-reply-already-approved', detail: `${Math.round(similarity * 100)}% lexical overlap with a previously approved reply.` });
      break; // one match is enough to flag for review
    }
  }

  return warnings;
}

/** Test-only: not intended for production use. */
export function clearDuplicateStateForTests(): void {
  userEngagementLog.length = 0;
}
