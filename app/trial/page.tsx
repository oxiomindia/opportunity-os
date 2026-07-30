import type { Metadata } from 'next';
import SiteHeader from '../components/marketing/SiteHeader';
import SiteFooter from '../components/marketing/SiteFooter';
import TrialRequestForm from '../components/marketing/TrialRequestForm';
import { ProductIcon } from '../components/marketing/icons';
import { getProductById, getPublicProducts } from '../../lib/products/catalog';
import { getProductDisplayName, getAvailabilityMessage } from '../../lib/products/types';
import { buildMetadata } from '../../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  path: '/trial',
  title: 'Request a Free 7-Day Trial | Oxiom',
  description: 'Request a free 7-day trial of any Oxiom product, or register early interest in what’s coming next.',
});

export default async function TrialPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product: productId } = await searchParams;
  const product = productId ? getProductById(productId) : undefined;
  const isTrialEligible = product ? product.status === 'live' : true;
  const availabilityMessage = product ? getAvailabilityMessage(product) : undefined;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <main>
        <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/60 to-white py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8 lg:px-10">
            {product ? (
              <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <ProductIcon icon={product.icon} size={28} />
              </span>
            ) : (
              <p className="text-sm font-semibold uppercase tracking-[.18em] text-blue-700">Oxiom</p>
            )}
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {product
                ? isTrialEligible
                  ? `Try ${getProductDisplayName(product)} free for 7 days`
                  : `Register interest in ${getProductDisplayName(product)}`
                : 'Request a free 7-day trial'}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              {availabilityMessage ?? (product
                ? `Full-featured access to ${getProductDisplayName(product)} — no restrictions during your trial. Tell us a bit about your business and we'll set you up.`
                : 'Full-featured access to any Oxiom product, no restrictions — tell us a bit about your business and we\'ll set you up.')}
            </p>

            <TrialRequestForm product={product} otherProducts={getPublicProducts()} isTrialEligible={isTrialEligible} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
