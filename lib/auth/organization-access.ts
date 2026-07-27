const organizationRequiredPrefixes = [
  '/invoices', '/upload', '/verification', '/reviews', '/accounts-review',
  '/payment-queue', '/reports', '/activity', '/settings', '/feedback',
] as const;

export function requiresOrganization(pathname: string) {
  return organizationRequiredPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
