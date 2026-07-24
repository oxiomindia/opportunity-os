export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
};

export const navigationItems: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', description: 'Workspace overview', icon: '⌂' },
  { href: '/invoices', label: 'Invoices', description: 'Invoice intake and worklists', icon: '□' },
  { href: '/extraction', label: 'Extraction', description: 'Local extraction simulation', icon: '◎' },
  { href: '/verification', label: 'Verification', description: 'Review extracted invoice data', icon: '✓' },
  { href: '/accounts-review', label: 'Accounts Review', description: 'Resolve accounting exceptions', icon: '◫' },
  { href: '/payment-queue', label: 'Payment Queue', description: 'Prepare approved payments', icon: '→' },
  { href: '/reports', label: 'Reports', description: 'Operational reporting', icon: '▤' },
  { href: '/settings', label: 'Settings', description: 'Workspace configuration', icon: '⚙' },
];
