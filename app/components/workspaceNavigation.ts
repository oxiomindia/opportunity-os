export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
};

export const navigationItems: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', description: 'Workspace overview', icon: '⌂' },
  { href: '/customers', label: 'Customers', description: 'Manage who you bill', icon: '☺' },
  { href: '/products', label: 'Products & Services', description: 'Your billing catalog', icon: '◆' },
  { href: '/invoices', label: 'Invoices', description: 'Invoice intake and worklists', icon: '□' },
  { href: '/verification', label: 'Verification', description: 'Review extracted invoice data', icon: '✓' },
  { href: '/accounts-review', label: 'Accounts Review', description: 'Resolve accounting exceptions', icon: '◫' },
  { href: '/payment-queue', label: 'Payment Queue', description: 'Prepare approved payments', icon: '→' },
  { href: '/reports', label: 'Reports', description: 'Operational reporting', icon: '▤' },
  { href: '/activity', label: 'Activity', description: 'Notifications and workflow events', icon: '○' },
  { href: '/settings', label: 'Settings', description: 'Workspace configuration', icon: '⚙' },
];
