import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '../components/marketing/SiteHeader';
import SiteFooter from '../components/marketing/SiteFooter';
import { ProductIcon } from '../components/marketing/icons';
import { getProductById, products } from '../../lib/products/catalog';
import { getProductDisplayName } from '../../lib/products/types';

const salesEmail = 'oximindia@gmail.com';

export const metadata: Metadata = {
  title: 'Book a Demo | Oxiom',
  description: 'Book a demo of any Oxiom product, or register early interest in what’s coming next.',
};

export default async function BookDemoPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product: productId } = await searchParams;
  const product = productId ? getProductById(productId) : undefined;
  const isComingSoon = product?.status === 'coming-soon';

  const subject = product
    ? isComingSoon
      ? `Early interest: ${getProductDisplayName(product)}`
      : `Book a demo: ${getProductDisplayName(product)}`
    : 'Book a demo: Oxiom';
  const body = product
    ? `Hi Oxiom team,\n\nI'm interested in ${getProductDisplayName(product)}${isComingSoon ? ' and would like to be notified when early access opens.' : ' and would like to book a demo.'}\n\nCompany:\nTeam size:\nBest time to reach me:\n`
    : `Hi Oxiom team,\n\nI'd like to book a demo. A little about us:\n\nCompany:\nProduct(s) of interest:\nTeam size:\nBest time to reach me:\n`;
  const mailtoHref = `mailto:${salesEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

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
              {product ? (isComingSoon ? `Get early access to ${getProductDisplayName(product)}` : `Book a demo of ${getProductDisplayName(product)}`) : 'Book a demo'}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              {product
                ? isComingSoon
                  ? `${getProductDisplayName(product)} is currently in development. Register your interest and our team will reach out as soon as early access opens.`
                  : `Tell us a bit about your team and we’ll set up a focused walkthrough of ${getProductDisplayName(product)}.`
                : 'Tell us a bit about your team and we’ll set up a focused walkthrough of the right Oxiom product for you.'}
            </p>

            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm">
              <p className="text-sm font-semibold text-slate-950">How this works</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                We don&apos;t have an automated booking system yet — click below to open a pre-filled email to our team, add a few details, and send it. We typically respond within one business day.
              </p>
              <a
                href={mailtoHref}
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {isComingSoon ? 'Email us your interest' : 'Open email to book a demo'}
              </a>
              <p className="mt-3 text-center text-xs text-slate-500">
                Prefer to email directly? <a href={`mailto:${salesEmail}`} className="font-semibold text-blue-700 hover:text-blue-800">{salesEmail}</a>
              </p>
            </div>

            {!product && (
              <div className="mt-12">
                <p className="text-sm font-semibold text-slate-700">Or pick a product first</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {products.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/book-demo?product=${entry.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-700"
                    >
                      <ProductIcon icon={entry.icon} size={16} />
                      {getProductDisplayName(entry)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
