export type ActivitySeverity = 'info' | 'warning' | 'success' | 'critical';
export type ActivityCategory = 'intake' | 'verification' | 'accounts-review' | 'payment' | 'system';

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  severity: ActivitySeverity;
  createdAt: string;
  href?: string;
  actor: string;
  unread: boolean;
}
