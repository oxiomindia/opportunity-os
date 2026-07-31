import assert from 'node:assert/strict';
import test from 'node:test';
import { clearDuplicateStateForTests, getDuplicateWarnings, recordUserEngagement, wasUserRecentlyEngaged } from './duplicates';
import { clearRegistryForTests, ingestOpportunity, updateOpportunityStatus } from './registry';

function reset() {
  clearRegistryForTests();
  clearDuplicateStateForTests();
}

test('wasUserRecentlyEngaged is true within the window and false after it, and is platform-scoped', () => {
  reset();
  const now = 1_700_000_000_000;
  recordUserEngagement('u/alice', 'reddit', now);

  assert.equal(wasUserRecentlyEngaged('u/alice', 'reddit', now + 1000), true);
  assert.equal(wasUserRecentlyEngaged('u/alice', 'reddit', now + 8 * 24 * 60 * 60 * 1000), false, 'outside the 7-day window');
  assert.equal(wasUserRecentlyEngaged('u/alice', 'linkedin', now + 1000), false, 'engagement on a different platform must not count');
});

test('getDuplicateWarnings flags an already-handled thread', () => {
  reset();
  const { opportunity } = ingestOpportunity({ platform: 'reddit', sourceUrl: 'u', threadId: 't1', authorHandle: 'a', snippet: 'x' });
  updateOpportunityStatus(opportunity.id, 'published');

  const warnings = getDuplicateWarnings({ platform: 'reddit', threadId: 't1', authorHandle: 'someone-else', candidateReplyBody: 'reply', approvedReplyBodies: [] });
  assert.ok(warnings.some((warning) => warning.type === 'thread-already-handled'));
});

test('getDuplicateWarnings flags a recently-engaged user', () => {
  reset();
  recordUserEngagement('u/bob', 'reddit');

  const warnings = getDuplicateWarnings({ platform: 'reddit', threadId: 'new-thread', authorHandle: 'u/bob', candidateReplyBody: 'reply', approvedReplyBodies: [] });
  assert.ok(warnings.some((warning) => warning.type === 'user-recently-engaged'));
});

test('getDuplicateWarnings flags a candidate reply that is lexically very similar to an already-approved one', () => {
  reset();
  const approved = 'Happy to help with this. You might find our Input Tax Credit Recovery tool useful.';
  const candidate = 'Happy to help with this! You might find our Input Tax Credit Recovery tool very useful.';

  const warnings = getDuplicateWarnings({ platform: 'reddit', threadId: 'other-thread', authorHandle: 'someone-new', candidateReplyBody: candidate, approvedReplyBodies: [approved] });
  assert.ok(warnings.some((warning) => warning.type === 'similar-reply-already-approved'));
});

test('getDuplicateWarnings returns no warnings for a genuinely fresh thread, user, and reply', () => {
  reset();
  const warnings = getDuplicateWarnings({
    platform: 'reddit',
    threadId: 'brand-new-thread',
    authorHandle: 'brand-new-user',
    candidateReplyBody: 'A completely original reply about something else entirely.',
    approvedReplyBodies: [],
  });
  assert.deepEqual(warnings, []);
});
