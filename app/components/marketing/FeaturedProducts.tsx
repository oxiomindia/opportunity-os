import { products } from '../../../lib/products/catalog';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  return (
    <section aria-labelledby="featured-products-title" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-700">Products</p>
          <h2 id="featured-products-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Every Oxiom product, built on one platform
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Start with what you need today. Add more as your finance operation grows — every Oxiom product shares the same workspace and the same account.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
