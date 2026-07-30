import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface AuditLogEntry {
  id: string;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeState: unknown;
  afterState: unknown;
  reason: string | null;
  requestId: string | null;
  occurredAt: string;
}

const PAGE_SIZE = 50;

export async function listAuditLogEntityTypes(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('commercial_audit_logs').select('entity_type');
  if (error || !data) return [];
  return Array.from(new Set(data.map((row) => row.entity_type as string))).sort();
}

export async function listAuditLogs(options: { entityType?: string; page?: number } = {}): Promise<{ entries: AuditLogEntry[]; hasMore: boolean }> {
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, options.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE; // fetch one extra to detect a next page

  let query = supabase
    .from('commercial_audit_logs')
    .select('id, action, entity_type, entity_id, before_state, after_state, reason, request_id, occurred_at, profiles(email)')
    .order('occurred_at', { ascending: false })
    .range(from, to);

  if (options.entityType) query = query.eq('entity_type', options.entityType);

  const { data, error } = await query;
  if (error) throw new Error('Unable to load audit logs');
  const rows = data ?? [];
  const hasMore = rows.length > PAGE_SIZE;
  const entries: AuditLogEntry[] = rows.slice(0, PAGE_SIZE).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    actorEmail: (row.profiles as { email?: string } | null)?.email ?? null,
    action: row.action as string,
    entityType: row.entity_type as string,
    entityId: (row.entity_id as string | null) ?? null,
    beforeState: row.before_state,
    afterState: row.after_state,
    reason: (row.reason as string | null) ?? null,
    requestId: (row.request_id as string | null) ?? null,
    occurredAt: row.occurred_at as string,
  }));
  return { entries, hasMore };
}
