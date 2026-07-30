import type { Metadata } from 'next';
import SiteHeader from '../components/marketing/SiteHeader';
import SiteFooter from '../components/marketing/SiteFooter';
import PricingCards from '../components/marketing/PricingCards';
import FaqSection from '../components/marketing/FaqSection';
import ContactSales from '../components/marketing/ContactSales';
import type { Product } from '../../lib/products/types';
import { getPublicProducts } from '../../lib/products/catalog';
import type { ProductPricing } from '../../lib/pricing/catalog';
import { getVisiblePricing, getPromoBanner } from '../../lib/pricing/catalog';

export const metadata: Metadata = {
  title: 'Pricing | Oxiom',
  description: 'Simple, transparent pricing for every Oxiom product — Accounts Payable, Accounts Receivable, Finance Suite, and Input Tax Credit Recovery & Reconciliation.',
};

const faqItems = [
  {
    question: 'What happens after my 7-day trial?',
    answer: 'Your trial gives you full-featured access with no restrictions. When it ends, we\'ll reach out to activate a paid subscription — your data and setup carry over with no migration required.',
  },
  {
    question: 'Can I switch products or plans later?',
    answer: 'Yes. You can move between Accounts Payable, Accounts Receivable, and Finance Suite, or add ITC Recovery (Input Tax Credit Recovery & Reconciliation), as your needs change.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No. The price you see is the price you pay — no hidden setup or onboarding fees.',
  },
  {
    question: 'Do you offer annual discounts?',
    answer: 'Yes — annual billing is discounted compared to paying monthly. Toggle to Annual above to see the difference for each product.',
  },
];

function resolvePlans(pricingEntries: ProductPricing[]): Array<{ product: Product; pricing: ProductPricing }> {
  const products = getPublicProducts();
  const plans: Array<{ product: Product; pricing: ProductPricing }> = [];
  for (const pricing of pricingEntries) {
    const product = products.find((entry) => entry.id === pricing.productId);
    if (product) plans.push({ product, pricing });
  }
  return plans;
}

export default async function PricingPage() {
  const [visiblePricing, promoBanner] = await Promise.all([getVisiblePricing(), getPromoBanner()]);
  const plans = resolvePlans(visiblePricing);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <main>
        <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/60 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8 lg:px-10">
            {promoBanner && (
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700">
                {promoBanner.headline}
              </span>
            )}
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Simple, transparent pricing</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {promoBanner ? promoBanner.description : 'Pick a product, start a free 7-day trial, and pay only for what you use.'}
            </p>
          </div>
        </section>

        <section aria-labelledby="pricing-cards-title" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <h2 id="pricing-cards-title" className="sr-only">Product pricing</h2>
            <PricingCards plans={plans} />
          </div>
        </section>

        <FaqSection items={faqItems} />
        <ContactSales />
      </main>
      <SiteFooter />
    </div>
  );
}
