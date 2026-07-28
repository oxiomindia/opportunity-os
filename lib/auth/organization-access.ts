const organizationRequiredPrefixes = [
  '/customers', '/products', '/invoices', '/reports', '/activity', '/settings', '/feedback',
] as const;

export function requiresOrganization(pathname: string) {
  return organizationRequiredPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
