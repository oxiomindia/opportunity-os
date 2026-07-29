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
  { href: '/invoices', label: 'Invoices', description: 'Create and track invoices', icon: '□' },
  { href: '/vendors', label: 'Vendors', description: 'Manage who you owe', icon: '⚑' },
  { href: '/reports', label: 'Reports', description: 'Operational reporting', icon: '▤' },
  { href: '/activity', label: 'Activity', description: 'Notifications and workflow events', icon: '○' },
  { href: '/settings', label: 'Settings', description: 'Workspace configuration', icon: '⚙' },
];
