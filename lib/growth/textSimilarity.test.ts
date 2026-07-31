import assert from 'node:assert/strict';
import test from 'node:test';
import { textSimilarity } from './textSimilarity';

test('identical text scores 1', () => {
  assert.equal(textSimilarity('Happy to help with GST reconciliation', 'Happy to help with GST reconciliation'), 1);
});

test('completely unrelated text scores 0', () => {
  assert.equal(textSimilarity('Happy to help with GST reconciliation', 'The weather is nice today'), 0);
});

test('heavily overlapping wording scores high even when not identical', () => {
  const similarity = textSimilarity(
    'Happy to help with this. You might find our ITC reconciliation tool useful.',
    'Happy to help with this! You might find our ITC reconciliation tool very useful.'
  );
  assert.ok(similarity > 0.6, `expected high similarity, got ${similarity}`);
});

test('empty strings never produce a division-by-zero and score 0', () => {
  assert.equal(textSimilarity('', 'something'), 0);
  assert.equal(textSimilarity('', ''), 0);
});

test('is symmetric', () => {
  const a = 'GST reconciliation is hard to get right';
  const b = 'GST filing and reconciliation take time to get right';
  assert.equal(textSimilarity(a, b), textSimilarity(b, a));
});
