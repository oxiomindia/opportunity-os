import assert from 'node:assert/strict';
import test from 'node:test';
import { clearCampaignsForTests, computeCampaignMetrics, getCampaign, listCampaigns, recordCampaignConversion, registerCampaign } from './campaignTracking';
import { clearTrackingStateForTests, recordClick } from '../growth/tracking';

function reset() {
  clearCampaignsForTests();
  clearTrackingStateForTests();
}

test('registerCampaign, listCampaigns, and getCampaign round-trip', () => {
  reset();
  const campaign = registerCampaign({ name: 'Reddit ITC launch', source: 'reddit', medium: 'social', utmCampaign: 'reddit-itc-launch' });
  assert.deepEqual(listCampaigns(), [campaign]);
  assert.deepEqual(getCampaign(campaign.id), campaign);
});

test('computeCampaignMetrics is zero for a campaign with no recorded activity', () => {
  reset();
  const campaign = registerCampaign({ name: 'Empty', source: 'x', medium: 'y', utmCampaign: 'empty-campaign' });
  assert.deepEqual(computeCampaignMetrics(campaign.utmCampaign), { clicks: 0, leads: 0, trials: 0, customers: 0 });
});

test('computeCampaignMetrics counts clicks from the shared click ledger by utm_campaign', () => {
  reset();
  const campaign = registerCampaign({ name: 'C', source: 'x', medium: 'y', utmCampaign: 'campaign-a' });
  recordClick({ destinationUrl: 'https://oxiom.in/pricing', utmSource: 'x', utmMedium: 'y', utmCampaign: 'campaign-a' });
  recordClick({ destinationUrl: 'https://oxiom.in/pricing', utmSource: 'x', utmMedium: 'y', utmCampaign: 'campaign-a' });
  recordClick({ destinationUrl: 'https://oxiom.in/pricing', utmSource: 'x', utmMedium: 'y', utmCampaign: 'a-different-campaign' });

  assert.equal(computeCampaignMetrics(campaign.utmCampaign).clicks, 2);
});

test('recordCampaignConversion attributes leads/trials/customers to the right campaign via the shared conversion ledger', () => {
  reset();
  const campaign = registerCampaign({ name: 'C', source: 'x', medium: 'y', utmCampaign: 'campaign-b' });
  recordCampaignConversion('campaign-b', 'signup');
  recordCampaignConversion('campaign-b', 'signup');
  recordCampaignConversion('campaign-b', 'trial');
  recordCampaignConversion('campaign-b', 'paid-customer');
  recordCampaignConversion('a-different-campaign', 'signup');

  assert.deepEqual(computeCampaignMetrics(campaign.utmCampaign), { clicks: 0, leads: 2, trials: 1, customers: 1 });
});
