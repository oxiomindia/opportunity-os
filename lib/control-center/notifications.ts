import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface ControlCenterNotification {
  id: string;
  severity: 'warning' | 'critical';
  title: string;
  detail: string;
  organizationId: string;
  organizationName: string;
}

const TRIAL_WARNING_DAYS = 3;
const RENEWAL_WARNING_DAYS = 14;

/**
 * Computed, not stored. There's no trial-request queue, subscription
 * event stream, or payment webhook in this codebase yet — a stored
 * notifications table would be empty infrastructure for events that don't
 * exist. Everything here is derived live from organization_commercial_profile,
 * the same data the Customer Directory reads. As Trials/Subscriptions/
 * Payments become real, more computed notification types can be added
 * here, or this can graduate to a stored table if read/dismiss state is
 * ever actually needed.
 */
export async function listNotifications(): Promise<ControlCenterNotification[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('organization_commercial_profile')
    .select('organization_id, trial_status, trial_ends_at, subscription_status, renewal_date, organizations(name)');
  if (error || !data) return [];

  const now = new Date();
  const trialWarningCutoff = new Date(now.getTime() + TRIAL_WARNING_DAYS * 24 * 60 * 60 * 1000);
  const renewalWarningCutoff = new Date(now.getTime() + RENEWAL_WARNING_DAYS * 24 * 60 * 60 * 1000);

  const notifications: ControlCenterNotification[] = [];

  for (const row of data as Record<string, unknown>[]) {
    const organizationId = row.organization_id as string;
    const organizationName = (row.organizations as { name?: string } | null)?.name ?? 'Unknown organization';

    if (row.trial_status === 'active' && row.trial_ends_at) {
      const endsAt = new Date(row.trial_ends_at as string);
      if (endsAt <= trialWarningCutoff) {
        notifications.push({
          id: `trial-${organizationId}`,
          severity: endsAt <= now ? 'critical' : 'warning',
          title: endsAt <= now ? 'Trial has ended' : 'Trial ending soon',
          detail: `${organizationName}'s trial ${endsAt <= now ? 'ended' : 'ends'} ${endsAt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
          organizationId,
          organizationName,
        });
      }
    }

    if (row.subscription_status === 'active' && row.renewal_date) {
      const renewalDate = new Date(row.renewal_date as string);
      if (renewalDate <= renewalWarningCutoff) {
        notifications.push({
          id: `renewal-${organizationId}`,
          severity: renewalDate <= now ? 'critical' : 'warning',
          title: renewalDate <= now ? 'Renewal overdue' : 'Renewal due soon',
          detail: `${organizationName}'s subscription ${renewalDate <= now ? 'was due' : 'renews'} ${renewalDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
          organizationId,
          organizationName,
        });
      }
    }

    if (row.subscription_status === 'past_due') {
      notifications.push({
        id: `past-due-${organizationId}`,
        severity: 'critical',
        title: 'Subscription past due',
        detail: `${organizationName}'s subscription is marked past due`,
        organizationId,
        organizationName,
      });
    }
  }

  return notifications.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1));
}
