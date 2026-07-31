import assert from 'node:assert/strict';
import test from 'node:test';
import { clearRegistryForTests, getOpportunity, ingestOpportunity, isThreadAlreadyHandled, listOpportunities, updateOpportunityStatus } from './registry';

function reset() {
  clearRegistryForTests();
}

test('ingestOpportunity classifies, scores, and stores a new opportunity as "new"', () => {
  reset();
  const { opportunity, wasAlreadyKnown } = ingestOpportunity({
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/india/comments/abc123',
    authorHandle: 'u/example',
    snippet: 'Looking for a good GST software recommendation for my small business.',
  });

  assert.equal(wasAlreadyKnown, false);
  assert.equal(opportunity.status, 'new');
  assert.equal(opportunity.platform, 'reddit');
  assert.ok(opportunity.keywords.includes('gst software'));
  assert.ok(opportunity.priorityScore > 0);
  assert.ok(opportunity.id);
  assert.ok(opportunity.discoveredAt);
});

test('ingesting the same (platform, threadId) pair twice returns the existing opportunity instead of creating a duplicate -- Thread Memory', () => {
  reset();
  const first = ingestOpportunity({ platform: 'reddit', sourceUrl: 'https://reddit.com/x', threadId: 'thread-1', authorHandle: 'a', snippet: 'GST filing help please' });
  const second = ingestOpportunity({ platform: 'reddit', sourceUrl: 'https://reddit.com/x', threadId: 'thread-1', authorHandle: 'a', snippet: 'a different snippet entirely' });

  assert.equal(second.wasAlreadyKnown, true);
  assert.equal(second.opportunity.id, first.opportunity.id);
  assert.equal(listOpportunities().length, 1);
});

test('threadId falls back to sourceUrl when a source cannot supply a distinct thread id', () => {
  reset();
  const first = ingestOpportunity({ platform: 'quora', sourceUrl: 'https://quora.com/q/1', authorHandle: 'a', snippet: 'x' });
  assert.equal(first.opportunity.threadId, 'https://quora.com/q/1');
});

test('listOpportunities sorts by priorityScore descending', () => {
  reset();
  ingestOpportunity({ platform: 'x', sourceUrl: 'u1', authorHandle: 'a', snippet: 'hi' }); // low priority
  ingestOpportunity({
    platform: 'x',
    sourceUrl: 'u2',
    authorHandle: 'b',
    snippet: 'Looking for GST software, ERP software, and vendor reconciliation help urgently',
  }); // high priority

  const [top] = listOpportunities();
  assert.equal(top.sourceUrl, 'u2');
});

test('getOpportunity and updateOpportunityStatus round-trip', () => {
  reset();
  const { opportunity } = ingestOpportunity({ platform: 'x', sourceUrl: 'u', authorHandle: 'a', snippet: 'hello' });
  assert.deepEqual(getOpportunity(opportunity.id), opportunity);

  const updated = updateOpportunityStatus(opportunity.id, 'published');
  assert.equal(updated?.status, 'published');
  assert.equal(updateOpportunityStatus('does-not-exist', 'published'), undefined);
});

test('isThreadAlreadyHandled is true only once an opportunity in that thread is marked published', () => {
  reset();
  const { opportunity } = ingestOpportunity({ platform: 'x', sourceUrl: 'u', threadId: 't1', authorHandle: 'a', snippet: 'hello' });
  assert.equal(isThreadAlreadyHandled('x', 't1'), false);

  updateOpportunityStatus(opportunity.id, 'published');
  assert.equal(isThreadAlreadyHandled('x', 't1'), true);
  assert.equal(isThreadAlreadyHandled('x', 'unknown-thread'), false);
});
