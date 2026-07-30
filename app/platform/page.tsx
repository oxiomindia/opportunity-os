import type { Metadata } from 'next';
import SiteHeader from '../components/marketing/SiteHeader';
import SiteFooter from '../components/marketing/SiteFooter';
import ProductCategorySection from '../components/marketing/ProductCategorySection';
import DemoCta from '../components/marketing/DemoCta';
import { getActiveCategories, getProductsByCategory } from '../../lib/products/catalog';
import { buildMetadata } from '../../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  path: '/platform',
  title: 'Products | Oxiom',
  description: 'Explore the full Oxiom product catalog — Accounts Payable, Accounts Receivable, Finance Suite, and what’s coming next.',
});

export default function ProductsPage() {
  const categories = getActiveCategories();

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <main>
        <section className="border-b border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <p className="text-sm font-semibold text-blue-700">Product catalog</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Every Oxiom product</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              One platform, organized by what your finance team needs. Start with one product or run the full suite — every Oxiom product shares the same secure workspace.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-20 px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          {categories.map((category) => (
            <ProductCategorySection key={category.id} category={category} products={getProductsByCategory(category.id)} />
          ))}
        </div>

        <DemoCta />
      </main>
      <SiteFooter />
    </div>
  );
}
