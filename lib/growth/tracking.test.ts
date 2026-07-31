import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUtmLink, clearTrackingStateForTests, computeFunnelSummary, listClicks, listConversions, recordClick, recordConversion } from './tracking';

function reset() {
  clearTrackingStateForTests();
}

test('buildUtmLink resolves a relative path against the real site origin and appends UTM params', () => {
  const link = buildUtmLink('/solutions/input-tax-credit-recovery', 'growth-reddit', 'social');
  const url = new URL(link);

  assert.equal(url.origin, 'https://oxiom.in');
  assert.equal(url.pathname, '/solutions/input-tax-credit-recovery');
  assert.equal(url.searchParams.get('utm_source'), 'oxiom-growth');
  assert.equal(url.searchParams.get('utm_medium'), 'social');
  assert.equal(url.searchParams.get('utm_campaign'), 'growth-reddit');
});

test('buildUtmLink defaults medium to "social"', () => {
  const url = new URL(buildUtmLink('/pricing', 'campaign-x'));
  assert.equal(url.searchParams.get('utm_medium'), 'social');
});

test('recordClick and listClicks round-trip', () => {
  reset();
  const click = recordClick({ destinationUrl: 'https://oxiom.in/pricing', utmSource: 'oxiom-growth', utmMedium: 'social', utmCampaign: 'c1' });
  assert.deepEqual(listClicks(), [click]);
  assert.ok(click.clickedAt);
});

test('recordConversion and listConversions round-trip, with optional metadata', () => {
  reset();
  const conversion = recordConversion('trial', 'opp-1', { plan: 'starter' });
  assert.deepEqual(listConversions(), [conversion]);
  assert.equal(conversion.stage, 'trial');
  assert.deepEqual(conversion.metadata, { plan: 'starter' });
});

test('computeFunnelSummary counts clicks and each conversion stage independently', () => {
  reset();
  recordClick({ destinationUrl: 'https://oxiom.in/pricing', utmSource: 's', utmMedium: 'm', utmCampaign: 'c' });
  recordClick({ destinationUrl: 'https://oxiom.in/pricing', utmSource: 's', utmMedium: 'm', utmCampaign: 'c' });
  recordConversion('website-visit');
  recordConversion('signup');
  recordConversion('signup');
  recordConversion('trial');
  recordConversion('paid-customer');

  const funnel = computeFunnelSummary();
  assert.deepEqual(funnel, { clicks: 2, websiteVisits: 1, signups: 2, trials: 1, paidCustomers: 1 });
});
