import assert from 'node:assert/strict';
import test from 'node:test';
import { isEligibleForApproval, QUALITY_THRESHOLD, scoreReplyQuality } from './qualityScoring';
import type { DraftContent } from './replyAssistant';
import type { Opportunity } from './types';

function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'opp-1',
    platform: 'reddit',
    sourceUrl: 'u',
    threadId: 't',
    authorHandle: 'a',
    snippet: 'Looking for GST software',
    keywords: ['gst software'],
    category: 'purchase-intent',
    priorityScore: 80,
    status: 'new',
    discoveredAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeDraft(overrides: Partial<DraftContent> = {}): DraftContent {
  return {
    body: 'A genuinely helpful, well-written reply addressing the question directly.',
    includesLink: false,
    suggestedDocs: [],
    ...overrides,
  };
}

test('a clean, relevant, non-duplicate draft scores at or above the quality threshold', () => {
  const score = scoreReplyQuality(makeDraft(), makeOpportunity(), []);
  assert.ok(score.overall >= QUALITY_THRESHOLD, `expected >= ${QUALITY_THRESHOLD}, got ${score.overall}`);
  assert.equal(isEligibleForApproval(score), true);
});

test('spam-pattern language raises spamRisk and lowers the overall score', () => {
  const clean = scoreReplyQuality(makeDraft(), makeOpportunity(), []);
  const spammy = scoreReplyQuality(makeDraft({ body: 'BUY NOW!! Limited time offer, click here, guaranteed results!!' }), makeOpportunity(), []);

  assert.ok(spammy.factors.spamRisk > clean.factors.spamRisk);
  assert.ok(spammy.overall < clean.overall);
});

test('duplicate warnings raise duplicateRisk and can push a draft below the approval threshold', () => {
  const noWarnings = scoreReplyQuality(makeDraft(), makeOpportunity(), []);
  const manyWarnings = scoreReplyQuality(
    makeDraft(),
    makeOpportunity(),
    [
      { type: 'thread-already-handled', detail: 'x' },
      { type: 'user-recently-engaged', detail: 'x' },
      { type: 'similar-reply-already-approved', detail: 'x' },
    ]
  );

  assert.ok(manyWarnings.factors.duplicateRisk > noWarnings.factors.duplicateRisk);
  assert.ok(manyWarnings.overall < noWarnings.overall);
});

test('a link without a stated rationale lowers linkAppropriateness compared to one with a rationale', () => {
  const withRationale = scoreReplyQuality(makeDraft({ includesLink: true, linkRationale: 'directly answers the question' }), makeOpportunity(), []);
  const unexplainedLink = scoreReplyQuality(makeDraft({ includesLink: true }), makeOpportunity(), []);

  assert.ok(unexplainedLink.factors.linkAppropriateness < withRationale.factors.linkAppropriateness);
});

test('isEligibleForApproval matches the QUALITY_THRESHOLD boundary exactly', () => {
  assert.equal(isEligibleForApproval({ overall: QUALITY_THRESHOLD, factors: {} as never }), true);
  assert.equal(isEligibleForApproval({ overall: QUALITY_THRESHOLD - 1, factors: {} as never }), false);
});
