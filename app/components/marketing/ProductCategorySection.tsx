import type { Product, ProductCategoryDef } from '../../../lib/products/types';
import ProductCard from './ProductCard';

/**
 * Renders one category heading plus a grid of every product in it. Used by
 * /products so the full catalog stays organized as it grows — adding a
 * category to lib/products/catalog.ts is enough to get a new section here,
 * no page changes required.
 */
export default function ProductCategorySection({
  category,
  products,
}: Readonly<{ category: ProductCategoryDef; products: Product[] }>) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby={`category-${category.id}-title`} id={category.id} className="scroll-mt-24">
      <div className="max-w-2xl">
        <h2 id={`category-${category.id}-title`} className="text-2xl font-semibold tracking-tight text-slate-950">
          {category.label}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
