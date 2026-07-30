export interface ControlCenterNotification {
  id: string;
  severity: 'warning' | 'critical';
  title: string;
  detail: string;
  organizationId: string;
  organizationName: string;
}

export interface CommercialProfileRow {
  organization_id: string;
  trial_status: string;
  trial_ends_at: string | null;
  subscription_status: string;
  renewal_date: string | null;
  organizations: { name?: string } | null;
}

const TRIAL_WARNING_DAYS = 3;
const RENEWAL_WARNING_DAYS = 14;

/**
 * Pure and independently testable: no I/O, just the classification rules.
 * lib/control-center/notifications.ts (server-only) owns fetching the rows
 * this function classifies.
 */
export function computeLifecycleNotifications(rows: CommercialProfileRow[], now: Date = new Date()): ControlCenterNotification[] {
  const trialWarningCutoff = new Date(now.getTime() + TRIAL_WARNING_DAYS * 24 * 60 * 60 * 1000);
  const renewalWarningCutoff = new Date(now.getTime() + RENEWAL_WARNING_DAYS * 24 * 60 * 60 * 1000);

  const notifications: ControlCenterNotification[] = [];

  for (const row of rows) {
    const organizationId = row.organization_id;
    const organizationName = row.organizations?.name ?? 'Unknown organization';

    if (row.trial_status === 'active' && row.trial_ends_at) {
      const endsAt = new Date(row.trial_ends_at);
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
      const renewalDate = new Date(row.renewal_date);
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

  return notifications;
}

export function bySeverity(a: ControlCenterNotification, b: ControlCenterNotification): number {
  if (a.severity === b.severity) return 0;
  return a.severity === 'critical' ? -1 : 1;
}
