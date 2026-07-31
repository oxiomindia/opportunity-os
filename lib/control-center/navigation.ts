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
  { id: 'trials', route: '/control-center/trials', title: 'Trials', description: 'Trial requests and approvals', icon: '◷', availability: 'available', requiredPermission: 'canManageCommercial' },
  { id: 'subscriptions', route: '/control-center/subscriptions', title: 'Subscriptions', description: 'Active subscriptions', icon: '↻', availability: 'available', requiredPermission: 'canManageCommercial' },
  { id: 'customers', route: '/control-center/customers', title: 'Customers', description: 'Customer directory and profiles', icon: '☺', availability: 'available', requiredPermission: 'canManageCustomers' },
  { id: 'revenue', route: '/control-center/revenue', title: 'Revenue', description: 'Business metrics', icon: '▲', availability: 'available', requiredPermission: 'canManageCommercial' },
  { id: 'promotions', route: '/control-center/promotions', title: 'Promotions', description: 'Promotional banners', icon: '◈', availability: 'available', requiredPermission: 'canManageCommercial' },
  { id: 'coupons', route: '/control-center/coupons', title: 'Coupons', description: 'Discount codes', icon: '▣', availability: 'available', requiredPermission: 'canManageCommercial' },
  { id: 'audit-logs', route: '/control-center/audit-logs', title: 'Audit Logs', description: 'Commercial activity history', icon: '▤', availability: 'available', requiredPermission: 'canViewAuditLogs' },
  { id: 'settings', route: '/control-center/settings', title: 'Settings', description: 'Control Center configuration', icon: '⚙', availability: 'available', requiredPermission: 'canManagePlatform' },
  { id: 'feedback', route: '/control-center/feedback', title: 'Feedback', description: 'Product feedback inbox, urgent queue, and weekly insights', icon: '✉', availability: 'available', requiredPermission: 'canAccessFeedback' },

  // Engine Registry (Engine Framework milestone), Event Monitor (Event Bus
  // milestone), Universal Report Platform (URP milestone), and Webhook
  // Engine (Webhook Engine milestone) are read-only Admin Console views
  // onto lib/engine/, lib/events/, lib/urp/, and lib/webhooks/
  // respectively. The remaining four stay reserved -- these still render
  // as disabled/"Planned" rows (see ControlCenterShell) so the information
  // architecture is right before System Health/etc. exist. No page or
  // route exists behind any of the 'planned' ones below — do not link to
  // them.
  { id: 'engine-registry', route: '/control-center/engine-registry', title: 'Engine Registry', description: 'Registered platform engines and their capabilities', icon: '▦', availability: 'available', requiredPermission: 'canManagePlatform' },
  { id: 'urp', route: '/control-center/reports-platform', title: 'Universal Report Platform', description: 'Shared reporting and export layer for every engine', icon: '▤', availability: 'available', requiredPermission: 'canManagePlatform' },
  { id: 'webhook-engine', route: '/control-center/webhooks', title: 'Webhook Engine', description: 'Outbound event subscriptions and delivery', icon: '⇄', availability: 'available', requiredPermission: 'canManagePlatform' },
  { id: 'event-monitor', route: '/control-center/events', title: 'Event Monitor', description: 'Live platform event stream', icon: '◉', availability: 'available', requiredPermission: 'canManagePlatform' },
  { id: 'system-health', route: '/control-center/system-health', title: 'System Health', description: 'Engine and integration health status', icon: '♥', availability: 'planned', requiredPermission: 'canManagePlatform' },
  { id: 'platform-configuration', route: '/control-center/platform-configuration', title: 'Platform Configuration', description: 'Global platform configuration', icon: '⌘', availability: 'planned', requiredPermission: 'canManagePlatform' },
  { id: 'integrations', route: '/control-center/integrations', title: 'Integrations', description: 'External system connections', icon: '⛓', availability: 'planned', requiredPermission: 'canManagePlatform' },
  { id: 'audit-diagnostics', route: '/control-center/audit-diagnostics', title: 'Audit & Diagnostics', description: 'Unified cross-engine audit trail and diagnostics', icon: '⚑', availability: 'planned', requiredPermission: 'canManagePlatform' },

  // Growth Intelligence wasn't part of the original Phase 2 reserved
  // platform-capability list above -- it's a new module (Growth
  // Intelligence Platform milestone), so it ships directly as 'available'
  // rather than going through a 'planned' placeholder stage first.
  { id: 'growth-intelligence', route: '/control-center/growth', title: 'Growth Intelligence', description: 'Social listening, opportunity queue, and engagement workflow', icon: '◎', availability: 'available', requiredPermission: 'canManagePlatform' },

  // Growth Operations and Readiness, added by the Production Demo Data +
  // Growth Operations milestone -- also new modules, also 'available'
  // immediately for the same reason growth-intelligence is above.
  { id: 'growth-operations', route: '/control-center/growth-operations', title: 'Growth Operations', description: 'Landing pages, content, and campaign tracking', icon: '▥', availability: 'available', requiredPermission: 'canManagePlatform' },
  { id: 'readiness', route: '/control-center/readiness', title: 'Demo Experience & Readiness', description: 'Demo dataset verification and deployment readiness', icon: '✓', availability: 'available', requiredPermission: 'canManagePlatform' },
];

export function getVisibleModules(role: ControlCenterRole): ControlCenterModule[] {
  return controlCenterModules.filter((module) => permissions[module.requiredPermission]({ role }));
}
