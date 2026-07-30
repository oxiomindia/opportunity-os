import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

/**
 * Every figure here is Projected Revenue: computed from active subscription
 * plan prices, not confirmed payments — there is no payment/invoice table
 * in this codebase yet. Nothing is entered manually; it's all derived from
 * subscriptions (Phase 2b Checkpoint 2), the commercial source of truth.
 * Read-only — Revenue has no write actions, so no migration was needed.
 */
export interface RevenueSummary {
  mrrPaise: number;
  arrPaise: number;
  currency: string;
  activeCustomers: number;
  activeSubscriptions: number;
}

export interface RevenueByGroup {
  key: string;
  label: string;
  mrrPaise: number;
  currency: string;
  subscriptionCount: number;
}

export interface TrialConversionStats {
  converted: number;
  terminalTotal: number;
  ratePercent: number;
}

export interface RenewalForecastBucket {
  label: string;
  subscriptionCount: number;
  projectedPaise: number;
  currency: string;
}

export interface SubscriptionGrowthPoint {
  monthLabel: string;
  newSubscriptions: number;
}

export interface RevenueDashboardData {
  summary: RevenueSummary;
  byProduct: RevenueByGroup[];
  byPlan: RevenueByGroup[];
  trialConversion: TrialConversionStats;
  renewalForecast: RenewalForecastBucket[];
  growth: SubscriptionGrowthPoint[];
}

interface SubscriptionRow {
  id: string;
  organization_id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  region: string;
  renewal_date: string | null;
  created_at: string;
  commercial_plans: { name?: string; platform_products?: { slug?: string } | null } | null;
}

interface PriceRow {
  plan_id: string;
  region: string;
  monthly_price_paise: number | null;
  annual_price_paise: number | null;
  currency: string;
  effective_from: string;
}

function currentPriceByPlanRegion(prices: PriceRow[]): Map<string, PriceRow> {
  const now = Date.now();
  const latest = new Map<string, PriceRow>();
  for (const price of prices) {
    if (new Date(price.effective_from).getTime() > now) continue;
    const key = `${price.plan_id}:${price.region}`;
    const existing = latest.get(key);
    if (!existing || new Date(price.effective_from) > new Date(existing.effective_from)) latest.set(key, price);
  }
  return latest;
}

function monthlyEquivalentPaise(sub: SubscriptionRow, price: PriceRow | undefined): number {
  if (!price) return 0;
  if (sub.billing_cycle === 'annual') return price.annual_price_paise ? Math.round(price.annual_price_paise / 12) : 0;
  return price.monthly_price_paise ?? 0;
}

export async function getRevenueDashboard(): Promise<RevenueDashboardData> {
  const supabase = await createSupabaseServerClient();

  const [{ data: subs, error: subsError }, { data: prices, error: pricesError }, { data: trials, error: trialsError }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id, organization_id, plan_id, status, billing_cycle, region, renewal_date, created_at, commercial_plans(name, platform_products(slug))'),
    supabase.from('commercial_product_pricing').select('plan_id, region, monthly_price_paise, annual_price_paise, currency, effective_from'),
    supabase.from('trials').select('status'),
  ]);
  if (subsError) throw new Error('Unable to load subscriptions for revenue');
  if (pricesError) throw new Error('Unable to load pricing for revenue');
  if (trialsError) throw new Error('Unable to load trials for revenue');

  const subscriptions = (subs ?? []) as unknown as SubscriptionRow[];
  const priceByPlanRegion = currentPriceByPlanRegion((prices ?? []) as PriceRow[]);
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  // A currency any active subscription actually bills in — every plan in
  // this codebase prices in INR today, so this is a display fallback, not
  // multi-currency arithmetic (mixed-currency sums are never added together
  // below; grouping is always keyed so same-currency amounts stay together).
  const currency = activeSubs
    .map((s) => priceByPlanRegion.get(`${s.plan_id}:${s.region}`)?.currency)
    .find((c): c is string => Boolean(c)) ?? 'INR';

  let mrrPaise = 0;
  const byProductMap = new Map<string, RevenueByGroup>();
  const byPlanMap = new Map<string, RevenueByGroup>();

  for (const sub of activeSubs) {
    const price = priceByPlanRegion.get(`${sub.plan_id}:${sub.region}`);
    const monthly = monthlyEquivalentPaise(sub, price);
    mrrPaise += monthly;

    const productSlug = sub.commercial_plans?.platform_products?.slug ?? 'unknown';
    const productEntry = byProductMap.get(productSlug) ?? { key: productSlug, label: productSlug, mrrPaise: 0, currency: price?.currency ?? currency, subscriptionCount: 0 };
    productEntry.mrrPaise += monthly;
    productEntry.subscriptionCount += 1;
    byProductMap.set(productSlug, productEntry);

    const planName = sub.commercial_plans?.name ?? 'Unknown plan';
    const planKey = sub.plan_id;
    const planEntry = byPlanMap.get(planKey) ?? { key: planKey, label: planName, mrrPaise: 0, currency: price?.currency ?? currency, subscriptionCount: 0 };
    planEntry.mrrPaise += monthly;
    planEntry.subscriptionCount += 1;
    byPlanMap.set(planKey, planEntry);
  }

  const activeCustomers = new Set(activeSubs.map((s) => s.organization_id)).size;

  const trialRows = trials ?? [];
  const converted = trialRows.filter((t) => t.status === 'converted').length;
  const terminalTotal = trialRows.filter((t) => ['converted', 'rejected', 'expired'].includes(t.status)).length;

  // Renewal Forecast: the full amount due at each subscription's next
  // renewal (not the monthly-equivalent run-rate MRR uses) — a different,
  // deliberately separate figure from MRR.
  const now = new Date();
  const bucketLabels = ['Overdue', 'Next 30 days', '31–60 days', '61–90 days', '90+ days'];
  const renewalForecast: RenewalForecastBucket[] = bucketLabels.map((label) => ({ label, subscriptionCount: 0, projectedPaise: 0, currency }));
  for (const sub of activeSubs) {
    if (!sub.renewal_date) continue;
    const price = priceByPlanRegion.get(`${sub.plan_id}:${sub.region}`);
    const dueAmount = sub.billing_cycle === 'annual' ? (price?.annual_price_paise ?? 0) : (price?.monthly_price_paise ?? 0);
    const daysUntil = Math.ceil((new Date(sub.renewal_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    const bucketIndex = daysUntil <= 0 ? 0 : daysUntil <= 30 ? 1 : daysUntil <= 60 ? 2 : daysUntil <= 90 ? 3 : 4;
    const target = renewalForecast[bucketIndex];
    target.subscriptionCount += 1;
    target.projectedPaise += dueAmount;
  }

  // Subscription Growth: new subscriptions per month, last 6 months.
  const growth: SubscriptionGrowthPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = subscriptions.filter((s) => {
      const created = new Date(s.created_at);
      return created >= monthStart && created < monthEnd;
    }).length;
    growth.push({ monthLabel: monthStart.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), newSubscriptions: count });
  }

  return {
    summary: {
      mrrPaise,
      arrPaise: mrrPaise * 12,
      currency,
      activeCustomers,
      activeSubscriptions: activeSubs.length,
    },
    byProduct: Array.from(byProductMap.values()).sort((a, b) => b.mrrPaise - a.mrrPaise),
    byPlan: Array.from(byPlanMap.values()).sort((a, b) => b.mrrPaise - a.mrrPaise),
    trialConversion: {
      converted,
      terminalTotal,
      ratePercent: terminalTotal > 0 ? Math.round((converted / terminalTotal) * 1000) / 10 : 0,
    },
    renewalForecast,
    growth,
  };
}
