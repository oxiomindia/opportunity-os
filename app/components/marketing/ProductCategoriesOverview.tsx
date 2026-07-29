import Link from 'next/link';
import { getActiveCategories, getProductsByCategory } from '../../../lib/products/catalog';
import CategoryTile from './CategoryTile';

/**
 * Shows the product-category taxonomy itself, not individual products —
 * demonstrates that Oxiom is organized to expand into new categories, not
 * just new products within today's four. Reading from the same catalog as
 * everything else means a new category appears here automatically once it
 * has at least one product.
 */
export default function ProductCategoriesOverview() {
  const categories = getActiveCategories();

  return (
    <section aria-labelledby="categories-title" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-blue-700">Product categories</p>
            <h2 id="categories-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              A growing platform, organized from the start
            </h2>
          </div>
          <Link href="/platform" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            View full catalog →
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryTile key={category.id} category={category} productCount={getProductsByCategory(category.id).length} />
          ))}
        </div>
      </div>
    </section>
  );
}
