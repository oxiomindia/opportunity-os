export type ActivitySeverity = 'info' | 'warning' | 'success' | 'critical';
export type ActivityCategory = 'invoice' | 'system';

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
