import { permissions, type ControlCenterPermission, type ControlCenterRole } from './permissions';

export type ControlCenterModuleAvailability = 'available' | 'planned';

export interface ControlCenterModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  availability: ControlCenterModuleAvailability;
  requiredPermission: ControlCenterPermission;
}

/**
 * The 11 modules from the approved Phase 2 proposal. Only 'available'
 * modules render as links — the rest exist so the shell's information
 * architecture is right from Checkpoint 1, even though most of them ship in
 * later checkpoints or later phases. requiredPermission is checked against
 * the viewer's role so a future non-Owner role only ever sees what it's
 * permitted to, without touching this list or the shell that renders it.
 */
export const controlCenterModules: ControlCenterModule[] = [
  { id: 'dashboard', route: '/control-center', title: 'Dashboard', description: 'Overview and pending actions', icon: '⌂', availability: 'available', requiredPermission: 'canAccessControlCenter' },
  { id: 'pricing', route: '/control-center/pricing', title: 'Pricing', description: 'Public pricing and promotions', icon: '₹', availability: 'available', requiredPermission: 'canManageCommercial' },
  { id: 'products', route: '/control-center/products', title: 'Products', description: 'Visibility and status', icon: '◆', availability: 'available', requiredPermission: 'canManageProducts' },
  { id: 'trials', route: '/control-center/trials', title: 'Trials', description: 'Trial requests and approvals', icon: '◷', availability: 'planned', requiredPermission: 'canManageCommercial' },
  { id: 'subscriptions', route: '/control-center/subscriptions', title: 'Subscriptions', description: 'Active subscriptions', icon: '↻', availability: 'planned', requiredPermission: 'canManageCommercial' },
  { id: 'customers', route: '/control-center/customers', title: 'Customers', description: 'Customer directory and profiles', icon: '☺', availability: 'available', requiredPermission: 'canManageCustomers' },
  { id: 'revenue', route: '/control-center/revenue', title: 'Revenue', description: 'Business metrics', icon: '▲', availability: 'planned', requiredPermission: 'canManageCommercial' },
  { id: 'promotions', route: '/control-center/promotions', title: 'Promotions', description: 'Promotional banners', icon: '◈', availability: 'planned', requiredPermission: 'canManageCommercial' },
  { id: 'coupons', route: '/control-center/coupons', title: 'Coupons', description: 'Discount codes', icon: '▣', availability: 'planned', requiredPermission: 'canManageCommercial' },
  { id: 'audit-logs', route: '/control-center/audit-logs', title: 'Audit Logs', description: 'Commercial activity history', icon: '▤', availability: 'available', requiredPermission: 'canViewAuditLogs' },
  { id: 'settings', route: '/control-center/settings', title: 'Settings', description: 'Control Center configuration', icon: '⚙', availability: 'planned', requiredPermission: 'canManagePlatform' },
];

export function getVisibleModules(role: ControlCenterRole): ControlCenterModule[] {
  return controlCenterModules.filter((module) => permissions[module.requiredPermission]({ role }));
}
