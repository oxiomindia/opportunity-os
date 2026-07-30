import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import DemoCta from '../../components/marketing/DemoCta';
import RelatedProducts from '../../components/RelatedProducts';
import { ProductIcon, CheckIcon } from '../../components/marketing/icons';
import { products, getProductById, getCategoryById } from '../../../lib/products/catalog';
import { getProductDisplayName, getProductBadge, getStatusTone, getAvailabilityMessage, getPrimaryCtaLabel } from '../../../lib/products/types';
import { buildMetadata } from '../../../lib/seo/metadata';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product) return {};
  const displayName = getProductDisplayName(product);
  return buildMetadata({
    path: `/platform/${slug}`,
    title: `${displayName} | Oxiom`,
    description: product.description,
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product) notFound();

  const category = getCategoryById(product.categoryId);
  const badge = getProductBadge(product);
  const tone = getStatusTone(product.status);
  const availabilityMessage = getAvailabilityMessage(product);
  const primaryCta = getPrimaryCtaLabel(product.status);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <main>
        <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/60 to-white py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
            <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
              <Link href="/platform" className="hover:text-blue-700">Products</Link>
              {category && <span> / {category.label}</span>}
            </nav>
            <div className="mt-6 flex items-start gap-4">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <ProductIcon icon={product.icon} size={28} />
              </span>
              <div>
                {badge && (
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${tone.bg} ${tone.text}`}>
                    {badge}
                  </span>
                )}
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{product.brand}</p>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{product.name}</h1>
              </div>
            </div>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{product.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={product.trialHref}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {primaryCta}
              </Link>
              <Link
                href="/platform"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Explore other products
              </Link>
            </div>
            {product.appHref && (
              <p className="mt-5 text-sm text-slate-500">
                Already a customer?{' '}
                <Link href={`/login?next=${encodeURIComponent(product.appHref)}`} className="font-semibold text-blue-700 hover:text-blue-800">
                  Sign in →
                </Link>
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="highlights-title" className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
            <h2 id="highlights-title" className="text-2xl font-semibold tracking-tight text-slate-950">Key highlights</h2>
            <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <CheckIcon size={14} />
                  </span>
                  <span className="leading-7 text-slate-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {availabilityMessage && (
          <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Availability</h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-600">{availabilityMessage}</p>
            </div>
          </section>
        )}

        <section aria-labelledby="related-products-title" className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
            <RelatedProducts productId={product.id} heading="Explore more of Oxiom" subheading="Products that complement what you're looking at" />
          </div>
        </section>

        <DemoCta
          title={`See ${getProductDisplayName(product)} in action`}
          description="Request a free 7-day trial — full-featured, no restrictions."
          href={product.trialHref}
          label={primaryCta}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
