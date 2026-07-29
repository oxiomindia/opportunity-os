/**
 * PLACEHOLDER DATA -- not the "Commercial Management module" described in
 * the product spec. There is no database table, admin panel, or Owner
 * role behind these numbers yet; changing a price today means editing
 * this file and redeploying, exactly the opposite of "no deployment
 * required." This file exists so the public Pricing page has a real,
 * working UI to build against now, with a shape (ProductPricing /
 * PromoBanner) designed to be a drop-in replacement for a real
 * database-backed read once that module exists -- swap the two functions
 * below for real queries and nothing else on the page needs to change.
 */

export interface ProductPricing {
  productId: string;
  monthlyPriceInr: number;
  annualPriceInr: number;
  /** e.g. "Early Access Add-on" for a product still in early access. */
  addOnLabel?: string;
  visible: boolean;
}

export interface PromoBanner {
  active: boolean;
  headline: string;
  description: string;
}

const pricingCatalog: ProductPricing[] = [
  { productId: 'accounts-payable', monthlyPriceInr: 999, annualPriceInr: 9999, visible: true },
  { productId: 'accounts-receivable', monthlyPriceInr: 999, annualPriceInr: 9999, visible: true },
  { productId: 'finance-suite', monthlyPriceInr: 1999, annualPriceInr: 19999, visible: true },
  { productId: 'itc-recovery-bot', monthlyPriceInr: 499, annualPriceInr: 4999, addOnLabel: 'Early Access Add-on', visible: true },
];

const activePromoBanner: PromoBanner = {
  active: true,
  headline: 'Founding Customer Offer',
  description: 'Lock in launch pricing before general availability — rates increase once Oxiom exits early access.',
};

export function getProductPricing(productId: string): ProductPricing | undefined {
  return pricingCatalog.find((entry) => entry.productId === productId);
}

export function getVisiblePricing(): ProductPricing[] {
  return pricingCatalog.filter((entry) => entry.visible);
}

export function getPromoBanner(): PromoBanner | undefined {
  return activePromoBanner.active ? activePromoBanner : undefined;
}
