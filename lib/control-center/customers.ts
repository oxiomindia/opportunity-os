import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface CustomerDirectoryRow {
  organizationId: string;
  name: string;
  slug: string;
  edition: string;
  ownerEmail: string | null;
  gstNumber: string | null;
  contactPerson: string | null;
  contactMobile: string | null;
  city: string | null;
  country: string | null;
  trialStatus: string;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  subscriptionStatus: string;
  currentPlanId: string | null;
  planName: string | null;
  renewalDate: string | null;
  lastLoginAt: string | null;
}

export interface CustomerTimelineEvent {
  id: string;
  eventType: string;
  eventSummary: string;
  occurredAt: string;
}

export interface CustomerNote {
  id: string;
  note: string;
  authorEmail: string | null;
  createdAt: string;
}

export interface CommercialPlanOption {
  id: string;
  productSlug: string;
  name: string;
}

/** Customer Directory: every organization, its commercial profile (if any), and last login. Optional search across name/contact/GST/owner email. */
export async function listCustomerDirectory(search?: string): Promise<CustomerDirectoryRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: orgs, error } = await supabase.from('organizations').select('id, name, slug, edition');
  if (error || !orgs) throw new Error('Unable to load organizations');

  const [{ data: profiles }, { data: members }, { data: lastLogins }] = await Promise.all([
    supabase.from('organization_commercial_profile').select('*, commercial_plans(name, product_id, platform_products(slug))'),
    supabase.from('organization_members').select('organization_id, user_id, role, profiles(email)').eq('role', 'owner').eq('active', true),
    supabase.rpc('get_organizations_last_login'),
  ]);

  const profileByOrg = new Map((profiles ?? []).map((row: Record<string, unknown>) => [row.organization_id as string, row]));
  const ownerEmailByOrg = new Map(
    (members ?? []).map((row: Record<string, unknown>) => [row.organization_id as string, (row.profiles as { email?: string } | null)?.email ?? null]),
  );
  const lastLoginByOrg = new Map<string, string | null>(
    (lastLogins ?? []).map((row: Record<string, unknown>) => [row.organization_id as string, row.last_sign_in_at as string | null]),
  );

  const rows: CustomerDirectoryRow[] = orgs.map((org) => {
    const profile = profileByOrg.get(org.id) as Record<string, unknown> | undefined;
    const plan = profile?.commercial_plans as { name?: string } | null | undefined;
    return {
      organizationId: org.id,
      name: org.name,
      slug: org.slug,
      edition: org.edition,
      ownerEmail: ownerEmailByOrg.get(org.id) ?? null,
      gstNumber: (profile?.gst_number as string | null) ?? null,
      contactPerson: (profile?.contact_person as string | null) ?? null,
      contactMobile: (profile?.contact_mobile as string | null) ?? null,
      city: (profile?.city as string | null) ?? null,
      country: (profile?.country as string | null) ?? null,
      trialStatus: (profile?.trial_status as string | undefined) ?? 'none',
      trialStartedAt: (profile?.trial_started_at as string | null) ?? null,
      trialEndsAt: (profile?.trial_ends_at as string | null) ?? null,
      subscriptionStatus: (profile?.subscription_status as string | undefined) ?? 'none',
      currentPlanId: (profile?.current_plan_id as string | null) ?? null,
      planName: plan?.name ?? null,
      renewalDate: (profile?.renewal_date as string | null) ?? null,
      lastLoginAt: lastLoginByOrg.get(org.id) ?? null,
    };
  });

  if (!search || !search.trim()) return rows;
  const needle = search.trim().toLowerCase();
  return rows.filter((row) =>
    [row.name, row.ownerEmail, row.contactPerson, row.gstNumber, row.city, row.country]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(needle)),
  );
}

export async function getCustomerDirectoryRow(organizationId: string): Promise<CustomerDirectoryRow | null> {
  const rows = await listCustomerDirectory();
  return rows.find((row) => row.organizationId === organizationId) ?? null;
}

export async function listCustomerTimeline(organizationId: string): Promise<CustomerTimelineEvent[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('customer_timeline_events')
    .select('id, event_type, event_summary, occurred_at')
    .eq('organization_id', organizationId)
    .order('occurred_at', { ascending: false })
    .limit(50);
  if (error) throw new Error('Unable to load customer timeline');
  return (data ?? []).map((row) => ({ id: row.id, eventType: row.event_type, eventSummary: row.event_summary, occurredAt: row.occurred_at }));
}

export async function listCustomerNotes(organizationId: string): Promise<CustomerNote[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('customer_notes')
    .select('id, note, created_at, profiles(email)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load customer notes');
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    note: row.note as string,
    authorEmail: (row.profiles as { email?: string } | null)?.email ?? null,
    createdAt: row.created_at as string,
  }));
}

export async function listCommercialPlanOptions(): Promise<CommercialPlanOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('commercial_plans').select('id, name, platform_products(slug)').order('name');
  if (error) throw new Error('Unable to load plans');
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    productSlug: (row.platform_products as { slug?: string } | null)?.slug ?? '',
    name: row.name as string,
  }));
}
