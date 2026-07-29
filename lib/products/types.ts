/**
 * live         — generally available today.
 * available-soon — announced, not yet open for signup.
 * early-access — announced, and interest/signup is being actively collected.
 * beta         — available to a limited set of customers under a beta agreement.
 * enterprise   — available only on an enterprise/custom-contract basis.
 * retired      — no longer sold; kept in the catalog for historical/redirect purposes
 *                and excluded from public listings by getPublicProducts().
 */
export type ProductStatus = 'live' | 'available-soon' | 'early-access' | 'beta' | 'enterprise' | 'retired';

export type ProductIconKey = 'accounts-payable' | 'accounts-receivable' | 'finance-suite' | 'itc-recovery';

export interface ProductCategoryDef {
  /** Stable identifier, used as the URL-safe key and to group products. */
  id: string;
  /** Displayed section/category heading, e.g. "Finance & Compliance". */
  label: string;
  /** One-line description shown under the category heading. */
  description: string;
}

export interface Product {
  /** URL-safe slug, unique across all products. Used for /platform/[slug]. */
  id: string;
  /** Always "Oxiom" today; kept as data so it is never re-typed per product. */
  brand: string;
  /** Product name WITHOUT the brand prefix, e.g. "Accounts Payable". */
  name: string;
  /** Which category this product belongs to. Must match a ProductCategoryDef.id. */
  categoryId: string;
  /** One-sentence summary shown on the product card. */
  tagline: string;
  /** Longer description shown on the product's detail page. */
  description: string;
  /** Short bullet list of key highlights/benefits. */
  highlights: string[];
  status: ProductStatus;
  /** Optional override for the card badge text. Defaults to a status-derived label when omitted. */
  badge?: string;
  icon: ProductIconKey;
  learnMoreHref: string;
  bookDemoHref: string;
}

/** Enforces the "every product name begins with the brand" rule structurally, not by convention. */
export function getProductDisplayName(product: Pick<Product, 'brand' | 'name'>): string {
  return `${product.brand} ${product.name}`;
}

const statusLabels: Record<ProductStatus, string> = {
  live: 'Live',
  'available-soon': 'Available Soon',
  'early-access': 'Early Access',
  beta: 'Beta',
  enterprise: 'Enterprise',
  retired: 'Retired',
};

export interface StatusTone {
  bg: string;
  text: string;
}

/** Visual tone per status. Positive/inviting for pre-launch statuses, muted for retired. */
const statusTones: Record<ProductStatus, StatusTone> = {
  live: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'available-soon': { bg: 'bg-slate-900', text: 'text-white' },
  'early-access': { bg: 'bg-blue-600', text: 'text-white' },
  beta: { bg: 'bg-amber-500', text: 'text-white' },
  enterprise: { bg: 'bg-indigo-900', text: 'text-white' },
  retired: { bg: 'bg-slate-200', text: 'text-slate-500' },
};

/**
 * Badge shown on cards and detail pages. A custom `badge` (e.g. "Most
 * Popular") always wins. Otherwise, "live" products show no badge at all —
 * that's the default, expected state and doesn't need calling out — every
 * other status shows its label so visitors always understand where a
 * product stands without it reading as unfinished.
 */
export function getProductBadge(product: Pick<Product, 'status' | 'badge'>): string | undefined {
  if (product.badge) return product.badge;
  if (product.status === 'live') return undefined;
  return statusLabels[product.status];
}

export function getStatusTone(status: ProductStatus): StatusTone {
  return statusTones[status];
}

const availabilityMessages: Partial<Record<ProductStatus, (displayName: string) => string>> = {
  'available-soon': (name) => `${name} is on the way. Register your interest and we'll let you know as soon as it's available.`,
  'early-access': (name) => `${name} is open for early access. Register your interest and our team will help you get set up.`,
  beta: (name) => `${name} is available in beta to a limited set of customers. Reach out to see if you qualify.`,
  enterprise: (name) => `${name} is available on Enterprise plans. Contact our team to discuss your requirements.`,
  retired: (name) => `${name} is no longer offered as a standalone product.`,
};

/**
 * Honest, status-specific context shown wherever a product's availability
 * needs explaining (detail page, book-demo page). Returns undefined for
 * "live" products, which need no extra explanation.
 */
export function getAvailabilityMessage(product: Pick<Product, 'status' | 'brand' | 'name'>): string | undefined {
  return availabilityMessages[product.status]?.(getProductDisplayName(product));
}
