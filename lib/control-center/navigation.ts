export type ControlCenterModuleStatus = 'available' | 'planned';

export interface ControlCenterModule {
  id: string;
  href: string;
  label: string;
  description: string;
  icon: string;
  status: ControlCenterModuleStatus;
}

/**
 * The 11 modules from the approved Phase 2 proposal. Only 'available'
 * modules render as links — the rest exist so the shell's information
 * architecture is right from Checkpoint 1, even though most of them ship in
 * later checkpoints or later phases.
 */
export const controlCenterModules: ControlCenterModule[] = [
  { id: 'dashboard', href: '/control-center', label: 'Dashboard', description: 'Overview and pending actions', icon: '⌂', status: 'available' },
  { id: 'pricing', href: '/control-center/pricing', label: 'Pricing', description: 'Public pricing and promotions', icon: '₹', status: 'planned' },
  { id: 'products', href: '/control-center/products', label: 'Products', description: 'Visibility and status', icon: '◆', status: 'planned' },
  { id: 'trials', href: '/control-center/trials', label: 'Trials', description: 'Trial requests and approvals', icon: '◷', status: 'planned' },
  { id: 'subscriptions', href: '/control-center/subscriptions', label: 'Subscriptions', description: 'Active subscriptions', icon: '↻', status: 'planned' },
  { id: 'customers', href: '/control-center/customers', label: 'Customers', description: 'Customer directory and profiles', icon: '☺', status: 'planned' },
  { id: 'revenue', href: '/control-center/revenue', label: 'Revenue', description: 'Business metrics', icon: '▲', status: 'planned' },
  { id: 'promotions', href: '/control-center/promotions', label: 'Promotions', description: 'Promotional banners', icon: '◈', status: 'planned' },
  { id: 'coupons', href: '/control-center/coupons', label: 'Coupons', description: 'Discount codes', icon: '▣', status: 'planned' },
  { id: 'audit-logs', href: '/control-center/audit-logs', label: 'Audit Logs', description: 'Commercial activity history', icon: '▤', status: 'planned' },
  { id: 'settings', href: '/control-center/settings', label: 'Settings', description: 'Control Center configuration', icon: '⚙', status: 'planned' },
];
