import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface TrialDirectoryRow {
  id: string;
  organizationId: string;
  organizationName: string;
  productSlug: string;
  status: string;
  contactPerson: string | null;
  startedAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export interface TrialDetail extends TrialDirectoryRow {
  contactEmail: string | null;
  contactMobile: string | null;
  extensionCount: number;
  convertedPlanId: string | null;
  convertedAt: string | null;
  rejectedReason: string | null;
  rejectedAt: string | null;
}

export interface TrialEvent {
  id: string;
  eventType: string;
  eventSummary: string;
  occurredAt: string;
}

export interface TrialNote {
  id: string;
  note: string;
  authorEmail: string | null;
  createdAt: string;
}

export interface OrganizationOption {
  id: string;
  name: string;
}

export interface ProductOption {
  id: string;
  slug: string;
}

function toDirectoryRow(row: Record<string, unknown>): TrialDirectoryRow {
  const org = row.organizations as { name?: string } | null;
  const product = row.platform_products as { slug?: string } | null;
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    organizationName: org?.name ?? 'Unknown organization',
    productSlug: product?.slug ?? 'unknown',
    status: row.status as string,
    contactPerson: (row.contact_person as string | null) ?? null,
    startedAt: (row.started_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

/** Trial Directory: every trial, newest first. Optional status filter. */
export async function listTrialDirectory(status?: string): Promise<TrialDirectoryRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('trials')
    .select('id, organization_id, status, contact_person, started_at, ends_at, created_at, organizations(name), platform_products(slug)')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw new Error('Unable to load trials');
  return (data ?? []).map((row: Record<string, unknown>) => toDirectoryRow(row));
}

/** Every trial for one organization, newest first — for the Customer Profile's Trials section. */
export async function listTrialsForOrganization(organizationId: string): Promise<TrialDirectoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('trials')
    .select('id, organization_id, status, contact_person, started_at, ends_at, created_at, organizations(name), platform_products(slug)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load trials for organization');
  return (data ?? []).map((row: Record<string, unknown>) => toDirectoryRow(row));
}

export async function getTrialDetail(trialId: string): Promise<TrialDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('trials')
    .select(
      'id, organization_id, status, contact_person, contact_email, contact_mobile, started_at, ends_at, extension_count, converted_plan_id, converted_at, rejected_reason, rejected_at, created_at, organizations(name), platform_products(slug)',
    )
    .eq('id', trialId)
    .maybeSingle();
  if (error) throw new Error('Unable to load trial');
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    ...toDirectoryRow(row),
    contactEmail: (row.contact_email as string | null) ?? null,
    contactMobile: (row.contact_mobile as string | null) ?? null,
    extensionCount: (row.extension_count as number | null) ?? 0,
    convertedPlanId: (row.converted_plan_id as string | null) ?? null,
    convertedAt: (row.converted_at as string | null) ?? null,
    rejectedReason: (row.rejected_reason as string | null) ?? null,
    rejectedAt: (row.rejected_at as string | null) ?? null,
  };
}

export async function listTrialEvents(trialId: string): Promise<TrialEvent[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('trial_events')
    .select('id, event_type, event_summary, occurred_at')
    .eq('trial_id', trialId)
    .order('occurred_at', { ascending: false });
  if (error) throw new Error('Unable to load trial timeline');
  return (data ?? []).map((row) => ({ id: row.id, eventType: row.event_type, eventSummary: row.event_summary, occurredAt: row.occurred_at }));
}

export async function listTrialNotes(trialId: string): Promise<TrialNote[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('trial_notes')
    .select('id, note, created_at, profiles(email)')
    .eq('trial_id', trialId)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load trial notes');
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    note: row.note as string,
    authorEmail: (row.profiles as { email?: string } | null)?.email ?? null,
    createdAt: row.created_at as string,
  }));
}

/** Organizations to request a trial for, in the "Request Trial" form. */
export async function listOrganizationOptions(): Promise<OrganizationOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('organizations').select('id, name').order('name');
  if (error) throw new Error('Unable to load organizations');
  return data ?? [];
}

/** Products to request a trial for, in the "Request Trial" form. */
export async function listProductOptions(): Promise<ProductOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('platform_products').select('id, slug').order('slug');
  if (error) throw new Error('Unable to load products');
  return data ?? [];
}
