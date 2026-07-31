import assert from 'node:assert/strict';
import test from 'node:test';
import { TemplateReplyAssistant } from './replyAssistant';
import type { Opportunity } from './types';

function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'opp-1',
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/x',
    threadId: 't1',
    authorHandle: 'u/example',
    snippet: 'Looking for a good ITC reconciliation tool, any recommendations?',
    keywords: ['itc reconciliation'],
    category: 'purchase-intent',
    priorityScore: 80,
    status: 'new',
    discoveredAt: new Date().toISOString(),
    ...overrides,
  };
}

test('generateDraft includes a relevant link for a link-eligible category with a keyword match', () => {
  const assistant = new TemplateReplyAssistant();
  const draft = assistant.generateDraft(makeOpportunity());

  assert.equal(draft.includesLink, true);
  assert.ok(draft.suggestedDocs.includes('/solutions/input-tax-credit-recovery'));
  assert.ok(draft.body.includes('/solutions/input-tax-credit-recovery'));
  assert.ok(draft.linkRationale);
});

test('generateDraft omits a link when no keyword matches the doc library', () => {
  const assistant = new TemplateReplyAssistant();
  const draft = assistant.generateDraft(makeOpportunity({ keywords: [], snippet: 'Just chatting about the weather' }));

  assert.equal(draft.includesLink, false);
  assert.deepEqual(draft.suggestedDocs, []);
  assert.equal(draft.linkRationale, undefined);
});

test('generateDraft omits a link for categories not eligible for one even with a keyword match', () => {
  const assistant = new TemplateReplyAssistant();
  const draft = assistant.generateDraft(makeOpportunity({ category: 'complaint', snippet: 'ITC reconciliation is so frustrating' }));

  assert.equal(draft.includesLink, false);
});

test('generateDraft always marks the body as a draft needing human edits', () => {
  const assistant = new TemplateReplyAssistant();
  const draft = assistant.generateDraft(makeOpportunity());
  assert.ok(draft.body.includes('[Draft'), 'the body must be clearly marked as a draft, not brand-ready copy');
});

test('provider id is stable so approval/quality-scoring code can attribute a draft to its generator', () => {
  const assistant = new TemplateReplyAssistant();
  assert.equal(assistant.id, 'template-v1');
});
