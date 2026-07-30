import Link from 'next/link';
import { getRelatedProducts } from '../../lib/products/catalog';
import { getProductDisplayName } from '../../lib/products/types';
import { ProductIcon } from './marketing/icons';

/**
 * The entire cross-sell UI. Reads relatedProducts off the catalog entry
 * for `productId` and renders whatever comes back -- nothing here is
 * hardcoded to a specific product, so a new product joins the ecosystem
 * purely by being added to another product's relatedProducts array.
 *
 * Shared between the public marketing site (product detail pages) and the
 * authenticated workspace app (e.g. the dashboard) -- same component,
 * same data, same "tasteful, not intrusive" one-panel treatment in both
 * places.
 */
export default function RelatedProducts({
  productId,
  heading = 'Expand Your Oxiom Workspace',
  subheading = 'You may also benefit from',
}: Readonly<{ productId: string; heading?: string; subheading?: string }>) {
  const related = getRelatedProducts(productId);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-products-heading" className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 id="related-products-heading" className="text-base font-semibold text-slate-950">{heading}</h2>
      <p className="mt-1 text-sm text-slate-500">{subheading}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {related.map((product) => (
          <Link
            key={product.id}
            href={product.learnMoreHref}
            className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ProductIcon icon={product.icon} size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-950">{getProductDisplayName(product)}</span>
              <span className="block text-xs leading-5 text-slate-500">{product.tagline}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
