import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';
import { listRecentConversions, type SubscriptionDirectoryRow } from './subscriptions';

export interface DashboardMetrics {
  totalCustomers: number;
  activeTrials: number;
  activeSubscriptions: number;
  expiringSoonSubscriptions: number;
  suspendedSubscriptions: number;
  cancelledSubscriptions: number;
  visibleProducts: number;
  recentAuditActivity: number;
  recentConversions: SubscriptionDirectoryRow[];
}

const EXPIRING_SOON_DAYS = 14;

/**
 * Real counts only — no revenue or financial figures, since no payment
 * data exists anywhere in this codebase yet. Trial and subscription counts
 * read the real trials/subscriptions tables directly (Phase 2b Checkpoints
 * 1-2) rather than the Customer Directory's headline cache, since those
 * tables are now the actual source of truth — Revenue can extend this with
 * real aggregates once it exists, not a placeholder for numbers that don't.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createSupabaseServerClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const expiringCutoff = new Date(Date.now() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: totalCustomers },
    { count: activeTrials },
    { count: activeSubscriptions },
    { count: expiringSoonSubscriptions },
    { count: suspendedSubscriptions },
    { count: cancelledSubscriptions },
    { count: visibleProducts },
    { count: recentAuditActivity },
    recentConversions,
  ] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('trials').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').gte('renewal_date', today).lte('renewal_date', expiringCutoff),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('commercial_product_settings').select('product_id', { count: 'exact', head: true }).eq('visible', true),
    supabase.from('commercial_audit_logs').select('id', { count: 'exact', head: true }).gte('occurred_at', sevenDaysAgo),
    listRecentConversions(5),
  ]);

  return {
    totalCustomers: totalCustomers ?? 0,
    activeTrials: activeTrials ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    expiringSoonSubscriptions: expiringSoonSubscriptions ?? 0,
    suspendedSubscriptions: suspendedSubscriptions ?? 0,
    cancelledSubscriptions: cancelledSubscriptions ?? 0,
    visibleProducts: visibleProducts ?? 0,
    recentAuditActivity: recentAuditActivity ?? 0,
    recentConversions,
  };
}
