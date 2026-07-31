import assert from 'node:assert/strict';
import test from 'node:test';
import { clearRegistryForTests, listOpportunities } from './registry';
import { ManualOpportunitySource, pollOpportunitySources } from './sources';
import type { OpportunitySourceProvider } from './sources';
import type { RawOpportunityInput } from './types';

function reset() {
  clearRegistryForTests();
}

test('ManualOpportunitySource.fetchOpportunities returns submitted items once and then empties', async () => {
  const source = new ManualOpportunitySource('reddit');
  source.submit({ sourceUrl: 'https://reddit.com/x', authorHandle: 'a', snippet: 'GST software recommendations?' });

  const first = await source.fetchOpportunities();
  assert.equal(first.length, 1);
  assert.equal(first[0].platform, 'reddit');

  const second = await source.fetchOpportunities();
  assert.deepEqual(second, []);
});

test('submit accepts a per-item platform override', async () => {
  const source = new ManualOpportunitySource('reddit');
  source.submit({ platform: 'linkedin', sourceUrl: 'u', authorHandle: 'a', snippet: 's' });
  const [item] = await source.fetchOpportunities();
  assert.equal(item.platform, 'linkedin');
});

test('pollOpportunitySources ingests every source\'s pending items into the Opportunity Registry', async () => {
  reset();
  const source = new ManualOpportunitySource('reddit');
  source.submit({ sourceUrl: 'https://reddit.com/x', authorHandle: 'a', snippet: 'Looking for a GST filing tool' });
  source.submit({ sourceUrl: 'https://reddit.com/y', authorHandle: 'b', snippet: 'ITC reconciliation is a nightmare' });

  const results = await pollOpportunitySources([source]);

  assert.equal(results.length, 2);
  assert.equal(listOpportunities().length, 2);
});

test('pollOpportunitySources works across multiple, independently-implemented sources', async () => {
  reset();
  const fakeSource: OpportunitySourceProvider = {
    id: 'fake',
    platform: 'quora',
    async fetchOpportunities(): Promise<RawOpportunityInput[]> {
      return [{ platform: 'quora', sourceUrl: 'https://quora.com/z', authorHandle: 'c', snippet: 'Any ERP recommendations?' }];
    },
  };

  const results = await pollOpportunitySources([fakeSource]);
  assert.equal(results.length, 1);
  assert.equal(results[0].opportunity.platform, 'quora');
});
