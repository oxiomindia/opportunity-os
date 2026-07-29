import type { ProductEdition } from '../../types/edition';

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
  /** Which licensed editions show this item. Omitted = every edition (shared foundation, not AP- or AR-specific). */
  editions?: readonly ProductEdition[];
};

export const navigationItems: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', description: 'Workspace overview', icon: '⌂' },
  { href: '/customers', label: 'Customers', description: 'Manage who you bill', icon: '☺', editions: ['ar', 'finance_suite'] },
  { href: '/products', label: 'Products & Services', description: 'Your billing catalog', icon: '◆', editions: ['ar', 'finance_suite'] },
  { href: '/invoices', label: 'Invoices', description: 'Create and track invoices', icon: '□', editions: ['ar', 'finance_suite'] },
  { href: '/vendors', label: 'Vendors', description: 'Manage who you owe', icon: '⚑', editions: ['ap', 'finance_suite'] },
  { href: '/bills', label: 'Bills', description: 'Review, approve, and pay vendor invoices', icon: '▥', editions: ['ap', 'finance_suite'] },
  { href: '/reports', label: 'Reports', description: 'Operational reporting', icon: '▤' },
  { href: '/activity', label: 'Activity', description: 'Notifications and workflow events', icon: '○' },
  { href: '/settings', label: 'Settings', description: 'Workspace configuration', icon: '⚙' },
];

export function getNavigationItemsForEdition(edition: ProductEdition): NavigationItem[] {
  return navigationItems.filter((item) => !item.editions || item.editions.includes(edition));
}
