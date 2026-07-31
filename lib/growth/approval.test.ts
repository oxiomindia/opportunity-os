import assert from 'node:assert/strict';
import test from 'node:test';
import { eventBus } from '../events/bus';
import { approveDraft, clearApprovalStateForTests, getDraft, listDrafts, listPublishedEngagements, recordPublication, rejectDraft, submitDraftForReview } from './approval';
import { clearDuplicateStateForTests, recordUserEngagement } from './duplicates';
import { QUALITY_THRESHOLD } from './qualityScoring';
import { clearRegistryForTests, getOpportunity, ingestOpportunity } from './registry';
import type { ReplyAssistantProvider } from './replyAssistant';

function reset() {
  clearRegistryForTests();
  clearDuplicateStateForTests();
  clearApprovalStateForTests();
}

function ingest(overrides: Partial<Parameters<typeof ingestOpportunity>[0]> = {}) {
  return ingestOpportunity({ platform: 'reddit', sourceUrl: `u-${Math.random()}`, authorHandle: 'u/example', snippet: 'Looking for a good GST software recommendation', ...overrides }).opportunity;
}

test('submitDraftForReview generates a draft, computes duplicate warnings and a quality score, and marks the opportunity "drafted"', async () => {
  reset();
  const opportunity = ingest();

  const draft = await submitDraftForReview(opportunity.id);

  assert.equal(draft.opportunityId, opportunity.id);
  assert.equal(draft.status, 'pending');
  assert.ok(draft.body.length > 0);
  assert.ok(draft.quality.overall >= 0);
  assert.deepEqual(draft.duplicateWarnings, []);
  assert.equal(getOpportunity(opportunity.id)?.status, 'drafted');
  assert.deepEqual(listDrafts(), [draft]);
});

test('submitDraftForReview throws for an unknown opportunity id', async () => {
  reset();
  await assert.rejects(() => submitDraftForReview('does-not-exist'), /was not found/);
});

test('submitDraftForReview accepts a custom assistant provider', async () => {
  reset();
  const opportunity = ingest();
  const customAssistant: ReplyAssistantProvider = {
    id: 'custom-test-assistant',
    generateDraft: () => ({ body: 'A custom-generated reply body.', includesLink: false, suggestedDocs: [] }),
  };

  const draft = await submitDraftForReview(opportunity.id, { assistant: customAssistant });
  assert.equal(draft.generatedBy, 'custom-test-assistant');
  assert.equal(draft.body, 'A custom-generated reply body.');
});

test('approveDraft marks the draft approved, sets reviewer metadata, and moves the opportunity to "approved"', async () => {
  reset();
  const opportunity = ingest();
  const draft = await submitDraftForReview(opportunity.id);

  const approved = approveDraft(draft.id, 'marketing-lead@oxiom.in', 'looks good');

  assert.equal(approved.status, 'approved');
  assert.equal(approved.reviewedBy, 'marketing-lead@oxiom.in');
  assert.equal(approved.reviewNotes, 'looks good');
  assert.ok(approved.reviewedAt);
  assert.equal(getOpportunity(opportunity.id)?.status, 'approved');
});

test('approveDraft throws for a draft scoring below the quality threshold -- a hard guard, not a suggestion', async () => {
  reset();
  // Stacks several genuine quality penalties so the fixture actually lands
  // below QUALITY_THRESHOLD: no keyword matches (lower relevance), a spam
  // pattern, an unexplained link, a short body (poor tone/grammar), and a
  // manufactured "user recently engaged" duplicate-risk warning.
  const opportunity = ingest({ snippet: 'just chatting, nothing relevant here' });
  recordUserEngagement(opportunity.authorHandle, opportunity.platform);
  const draft = await submitDraftForReview(opportunity.id, {
    assistant: { id: 'bad-assistant', generateDraft: () => ({ body: 'buy now!!', includesLink: true, suggestedDocs: [] }) },
  });

  assert.ok(draft.quality.overall < QUALITY_THRESHOLD, `fixture must actually score below threshold for this test to be meaningful (got ${draft.quality.overall})`);
  assert.throws(() => approveDraft(draft.id, 'reviewer'), /below the quality threshold/);
  assert.equal(getDraft(draft.id)?.status, 'pending', 'a rejected-by-guard approval must not change the draft status');
});

test('approveDraft throws for an unknown draft id', () => {
  reset();
  assert.throws(() => approveDraft('does-not-exist', 'reviewer'), /was not found/);
});

test('rejectDraft marks the draft rejected with reviewer metadata', async () => {
  reset();
  const opportunity = ingest();
  const draft = await submitDraftForReview(opportunity.id);

  const rejected = rejectDraft(draft.id, 'reviewer', 'not on brand');
  assert.equal(rejected.status, 'rejected');
  assert.equal(rejected.reviewNotes, 'not on brand');
});

test('recordPublication requires an approved draft', async () => {
  reset();
  const opportunity = ingest();
  const draft = await submitDraftForReview(opportunity.id);

  await assert.rejects(() => recordPublication(draft.id, 'https://reddit.com/x/comment/1', 'marketer'), /must be approved/);
});

test('recordPublication marks the draft and opportunity published, logs the engagement, records user engagement, and publishes growth.engagement-published', async () => {
  reset();
  eventBus.clearForTests();
  const opportunity = ingest();
  const draft = await submitDraftForReview(opportunity.id);
  approveDraft(draft.id, 'reviewer');

  const received: string[] = [];
  eventBus.subscribe('growth.engagement-published', (event) => {
    received.push(event.eventId);
  });

  const engagement = await recordPublication(draft.id, 'https://reddit.com/x/comment/1', 'marketer@oxiom.in');

  assert.equal(engagement.opportunityId, opportunity.id);
  assert.equal(engagement.draftId, draft.id);
  assert.equal(engagement.publishedUrl, 'https://reddit.com/x/comment/1');
  assert.equal(getDraft(draft.id)?.status, 'published');
  assert.equal(getOpportunity(opportunity.id)?.status, 'published');
  assert.deepEqual(listPublishedEngagements(), [engagement]);
  assert.equal(received.length, 1);
});

test('a second draft for the same platform after one is approved gets a similar-reply duplicate warning', async () => {
  reset();
  const firstOpportunity = ingest();
  const assistant: ReplyAssistantProvider = {
    id: 'fixed-body-assistant',
    generateDraft: () => ({ body: 'Happy to help -- our Input Tax Credit Recovery tool handles exactly this.', includesLink: false, suggestedDocs: [] }),
  };

  const firstDraft = await submitDraftForReview(firstOpportunity.id, { assistant });
  approveDraft(firstDraft.id, 'reviewer');

  const secondOpportunity = ingest({ sourceUrl: 'https://reddit.com/different-thread' });
  const secondDraft = await submitDraftForReview(secondOpportunity.id, { assistant });

  assert.ok(secondDraft.duplicateWarnings.some((warning) => warning.type === 'similar-reply-already-approved'));
});
