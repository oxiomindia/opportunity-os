import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface DashboardMetrics {
  totalCustomers: number;
  activeTrials: number;
  activeSubscriptions: number;
  visibleProducts: number;
  recentAuditActivity: number;
}

/**
 * Real counts only — no revenue or financial figures, since no payment
 * data exists anywhere in this codebase yet. This is a foundation other
 * modules (Revenue, Subscriptions) can extend with their own real
 * aggregates once they exist, not a placeholder for numbers that don't.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createSupabaseServerClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: totalCustomers }, { data: profiles }, { count: visibleProducts }, { count: recentAuditActivity }] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('organization_commercial_profile').select('trial_status, subscription_status'),
    supabase.from('commercial_product_settings').select('product_id', { count: 'exact', head: true }).eq('visible', true),
    supabase.from('commercial_audit_logs').select('id', { count: 'exact', head: true }).gte('occurred_at', sevenDaysAgo),
  ]);

  const activeTrials = (profiles ?? []).filter((row) => row.trial_status === 'active').length;
  const activeSubscriptions = (profiles ?? []).filter((row) => row.subscription_status === 'active').length;

  return {
    totalCustomers: totalCustomers ?? 0,
    activeTrials,
    activeSubscriptions,
    visibleProducts: visibleProducts ?? 0,
    recentAuditActivity: recentAuditActivity ?? 0,
  };
}
