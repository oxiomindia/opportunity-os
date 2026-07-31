import type { DraftContent } from './replyAssistant';
import type { DuplicateWarning, Opportunity, QualityScore } from './types';

/** Replies scoring below this must not be approved -- enforced as a hard
 * guard in approval.ts:approveDraft, not just documented here. */
export const QUALITY_THRESHOLD = 60;

const SPAM_PATTERNS: readonly RegExp[] = [/\b(buy now|limited time|click here|act now|guarantee\w*)\b/i, /!{2,}/, /(https?:\/\/\S+){2,}/i];

/**
 * Rule-based, deterministic, fully-testable quality scoring covering the
 * factors the platform brief lists: relevance, helpfulness (folded into
 * relevance + tone/grammar here), spam risk, duplicate risk, link
 * appropriateness, tone/grammar, and brand consistency. Platform policy
 * compliance is a human judgment call this milestone doesn't attempt to
 * automate -- see README.
 */
export function scoreReplyQuality(draft: DraftContent, opportunity: Opportunity, duplicateWarnings: readonly DuplicateWarning[]): QualityScore {
  const relevance = opportunity.keywords.length > 0 ? 90 : 60;
  const spamRisk = SPAM_PATTERNS.some((pattern) => pattern.test(draft.body)) ? 70 : 5;
  const duplicateRisk = Math.min(100, duplicateWarnings.length * 35);
  const linkAppropriateness = draft.includesLink && !draft.linkRationale ? 40 : 90;
  const toneAndGrammar = draft.body.trim().length > 20 ? 85 : 40;
  // A still-present "[Draft" placeholder marker is a deliberate signal
  // that this text hasn't had a human pass yet -- it should never itself
  // read as brand-ready copy.
  const brandConsistency = draft.body.includes('[Draft') ? 70 : 90;

  const factors = { relevance, spamRisk, duplicateRisk, linkAppropriateness, toneAndGrammar, brandConsistency };
  const overall = Math.round(
    relevance * 0.25 +
      (100 - spamRisk) * 0.2 +
      (100 - duplicateRisk) * 0.2 +
      linkAppropriateness * 0.1 +
      toneAndGrammar * 0.15 +
      brandConsistency * 0.1
  );

  return { overall, factors };
}

export function isEligibleForApproval(score: QualityScore): boolean {
  return score.overall >= QUALITY_THRESHOLD;
}
