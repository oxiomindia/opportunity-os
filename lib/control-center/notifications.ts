import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';
import { computeLifecycleNotifications, bySeverity, type ControlCenterNotification, type CommercialProfileRow } from './notification-rules';

export type { ControlCenterNotification } from './notification-rules';

/**
 * The single abstraction every notification-producing module extends. The
 * Dashboard only ever calls listNotifications() and reads
 * ControlCenterNotification[] — it has no idea whether a given source
 * computes its results live, reads a stored table, or does both. A future
 * module (Trials, Subscriptions, Payments, Support) adds notifications by
 * registering one of these below; the UI never changes.
 */
export interface NotificationSource {
  /** For debugging/logging only — never shown to the Owner. */
  name: string;
  fetch(): Promise<ControlCenterNotification[]>;
}

/**
 * Computed, not stored. There's no trial-request queue, subscription event
 * stream, or payment webhook in this codebase yet — a stored notifications
 * table would be empty infrastructure for events that don't exist. Reads
 * the same data the Customer Directory does. If a future module needs
 * stored, dismissible notifications (e.g. a real trial-approval queue),
 * that becomes a second NotificationSource below — computeLifecycleNotifications
 * and this source's shape don't change.
 */
const lifecycleNotificationSource: NotificationSource = {
  name: 'lifecycle',
  async fetch() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('organization_commercial_profile')
      .select('organization_id, trial_status, trial_ends_at, subscription_status, renewal_date, organizations(name)');
    if (error || !data) return [];
    return computeLifecycleNotifications(data as unknown as CommercialProfileRow[]);
  },
};

const notificationSources: NotificationSource[] = [lifecycleNotificationSource];

export async function listNotifications(): Promise<ControlCenterNotification[]> {
  const results = await Promise.all(notificationSources.map((source) => source.fetch()));
  return results.flat().sort(bySeverity);
}
