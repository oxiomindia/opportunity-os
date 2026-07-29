export type ProductStatus = 'live' | 'coming-soon';

export type ProductIconKey = 'accounts-payable' | 'accounts-receivable' | 'finance-suite' | 'itc-recovery';

export interface ProductCategoryDef {
  /** Stable identifier, used as the URL-safe key and to group products. */
  id: string;
  /** Displayed section/category heading, e.g. "Finance Automation". */
  label: string;
  /** One-line description shown under the category heading. */
  description: string;
}

export interface Product {
  /** URL-safe slug, unique across all products. Used for /products/[slug]. */
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

export function getProductBadge(product: Pick<Product, 'status' | 'badge'>): string | undefined {
  if (product.badge) return product.badge;
  if (product.status === 'coming-soon') return 'Coming Soon';
  return undefined;
}
