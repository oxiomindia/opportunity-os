import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface SubscriptionDirectoryRow {
  id: string;
  organizationId: string;
  organizationName: string;
  productSlug: string;
  planId: string;
  planName: string;
  status: string;
  billingCycle: string;
  startDate: string;
  renewalDate: string | null;
  createdAt: string;
}

export interface SubscriptionDetail extends SubscriptionDirectoryRow {
  region: string;
  sourceTrialId: string | null;
  monthlyPricePaise: number | null;
  annualPricePaise: number | null;
  currency: string | null;
}

export interface SubscriptionEvent {
  id: string;
  eventType: string;
  eventSummary: string;
  occurredAt: string;
}

function toDirectoryRow(row: Record<string, unknown>): SubscriptionDirectoryRow {
  const plan = row.commercial_plans as { name?: string; platform_products?: { slug?: string } | null } | null;
  const org = row.organizations as { name?: string } | null;
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    organizationName: org?.name ?? 'Unknown organization',
    productSlug: plan?.platform_products?.slug ?? 'unknown',
    planId: row.plan_id as string,
    planName: plan?.name ?? 'Unknown plan',
    status: row.status as string,
    billingCycle: row.billing_cycle as string,
    startDate: row.start_date as string,
    renewalDate: (row.renewal_date as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

const directorySelect = 'id, organization_id, plan_id, status, billing_cycle, start_date, renewal_date, created_at, organizations(name), commercial_plans(name, platform_products(slug))';

/** Subscription Directory: every subscription, newest first. Optional status filter. */
export async function listSubscriptionDirectory(status?: string): Promise<SubscriptionDirectoryRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('subscriptions').select(directorySelect).order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw new Error('Unable to load subscriptions');
  return (data ?? []).map((row: Record<string, unknown>) => toDirectoryRow(row));
}

/** Every subscription for one organization, newest first — for the Customer Profile's Subscriptions section. */
export async function listSubscriptionsForOrganization(organizationId: string): Promise<SubscriptionDirectoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select(directorySelect)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load subscriptions for organization');
  return (data ?? []).map((row: Record<string, unknown>) => toDirectoryRow(row));
}

export async function getSubscriptionDetail(subscriptionId: string): Promise<SubscriptionDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`${directorySelect}, region, source_trial_id`)
    .eq('id', subscriptionId)
    .maybeSingle();
  if (error) throw new Error('Unable to load subscription');
  if (!data) return null;
  const row = data as Record<string, unknown>;
  const base = toDirectoryRow(row);

  // Price is never stored on the subscription — read the plan's current
  // effective price live, the same way the public /pricing page does.
  const { data: priceRow } = await supabase
    .from('commercial_product_pricing')
    .select('monthly_price_paise, annual_price_paise, currency')
    .eq('plan_id', base.planId)
    .eq('region', (row.region as string) ?? 'global')
    .lte('effective_from', new Date().toISOString())
    .order('effective_from', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    ...base,
    region: (row.region as string) ?? 'global',
    sourceTrialId: (row.source_trial_id as string | null) ?? null,
    monthlyPricePaise: (priceRow?.monthly_price_paise as number | null) ?? null,
    annualPricePaise: (priceRow?.annual_price_paise as number | null) ?? null,
    currency: (priceRow?.currency as string | null) ?? null,
  };
}

export async function listSubscriptionEvents(subscriptionId: string): Promise<SubscriptionEvent[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('subscription_events')
    .select('id, event_type, event_summary, occurred_at')
    .eq('subscription_id', subscriptionId)
    .order('occurred_at', { ascending: false });
  if (error) throw new Error('Unable to load subscription timeline');
  return (data ?? []).map((row) => ({ id: row.id, eventType: row.event_type, eventSummary: row.event_summary, occurredAt: row.occurred_at }));
}

/** Recently converted trials, for the Dashboard's "Recent Conversions" panel. */
export async function listRecentConversions(limit = 5): Promise<SubscriptionDirectoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select(directorySelect)
    .not('source_trial_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error('Unable to load recent conversions');
  return (data ?? []).map((row: Record<string, unknown>) => toDirectoryRow(row));
}
