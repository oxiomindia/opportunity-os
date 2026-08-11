import { getPublicProducts } from '../../../lib/products/catalog';
import ProductCard from './ProductCard';

export default function BusinessSolutions() {
  const products = getPublicProducts();

  return (
    <section id="products" aria-labelledby="business-solutions-title" className="scroll-mt-24 bg-white py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-700">Explore Oxiom Products</p>
          <h2 id="business-solutions-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            Every Oxiom solution, built on one platform
          </h2>
          <p className="mt-3 hidden text-sm leading-6 text-slate-600 sm:block sm:text-base">
            Start with what you need today. Add more as your finance operation grows - every Oxiom solution shares the same workspace and the same account.
          </p>
        </div>
        <div className="mt-4 grid gap-5 sm:mt-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
