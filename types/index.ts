export interface SidebarItem {
  id: string;
  label: string;
  iconName: string;
}

export interface Agent {
  id: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface DepthOption {
  value: string;
  label: string;
}

export interface OpportunityResult {
  id: number;
  source: string;
  title: string;
  summary: string;
  severity: 'High' | 'Medium' | 'Low';
  score: number;
  link: string;
}

export interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

export interface KPIData {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down';
  iconName: string;
  color: 'blue' | 'green' | 'amber' | 'slate';
}
export type {
  Invoice,
  InvoiceCurrency,
  InvoiceLineItem,
  InvoiceStatus,
} from './invoice';
export { invoiceStatuses } from './invoice';
