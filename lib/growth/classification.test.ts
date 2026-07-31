import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyOpportunity, extractKeywords, scoreOpportunityPriority } from './classification';

test('classifyOpportunity detects purchase intent', () => {
  assert.equal(classifyOpportunity('Looking for a good GST software for my small business'), 'purchase-intent');
});

test('classifyOpportunity detects a recommendation request', () => {
  assert.equal(classifyOpportunity('Can anyone recommend a reliable ERP tool?'), 'recommendation-request');
});

test('classifyOpportunity detects a competitor comparison', () => {
  assert.equal(classifyOpportunity('Oxiom vs Zoho Books, which is better for GST filing?'), 'competitor-comparison');
});

test('classifyOpportunity detects a complaint', () => {
  assert.equal(classifyOpportunity('This reconciliation process is so frustrating, nothing matches up'), 'complaint');
});

test('classifyOpportunity detects a support request', () => {
  assert.equal(classifyOpportunity('How do I fix this GSTR-2B mismatch error?'), 'support-request');
});

test('classifyOpportunity falls back to general-discussion when nothing matches', () => {
  assert.equal(classifyOpportunity('Just had lunch, back to work now'), 'general-discussion');
});

test('extractKeywords finds every library phrase present, case-insensitively', () => {
  const keywords = extractKeywords('Struggling with ITC Reconciliation and GSTR-2B mismatches this month');
  assert.ok(keywords.includes('itc reconciliation'));
  assert.ok(keywords.includes('gstr-2b'));
});

test('extractKeywords returns an empty array when no library phrase is present', () => {
  assert.deepEqual(extractKeywords('Nice weather today'), []);
});

test('scoreOpportunityPriority weighs category, keyword density, and substance', () => {
  const highValue = scoreOpportunityPriority({
    category: 'purchase-intent',
    keywords: ['gst software', 'erp software', 'small business erp', 'reconciliation', 'gst filing'],
    snippet: 'A long, substantive post describing exactly what is needed and why.',
  });
  // categoryScore (40, capped) + keywordScore (min(5*10, 40) = 40) + substanceBonus (10) = 90
  assert.equal(highValue, 90);

  const lowValue = scoreOpportunityPriority({ category: 'general-discussion', keywords: [], snippet: 'hi' });
  assert.equal(lowValue, 5);
});

test('scoreOpportunityPriority never exceeds 100 regardless of how many keywords are supplied', () => {
  const score = scoreOpportunityPriority({
    category: 'purchase-intent',
    keywords: Array.from({ length: 20 }, (_, index) => `keyword-${index}`),
    snippet: 'A long, substantive post.',
  });
  assert.ok(score <= 100);
});
