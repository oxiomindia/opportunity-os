import Link from 'next/link';
import type { Product } from '../../../lib/products/types';
import { getProductBadge, getStatusTone } from '../../../lib/products/types';
import { ProductIcon, CheckIcon, ArrowRightIcon } from './icons';

/**
 * Visual accent per category. Falls back to a neutral slate accent for any
 * category not listed here, so adding a new category never breaks styling.
 */
const categoryAccents: Record<string, { bg: string; text: string; ring: string }> = {
  'accounts-payable': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-100' },
  'accounts-receivable': { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-100' },
  'finance-suite': { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-100' },
  'finance-compliance': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-100' },
};
const defaultAccent = { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200' };

export default function ProductCard({ product }: Readonly<{ product: Product }>) {
  const accent = categoryAccents[product.categoryId] ?? defaultAccent;
  const badge = getProductBadge(product);
  const tone = getStatusTone(product.status);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.text} ring-1 ${accent.ring}`}>
          <ProductIcon icon={product.icon} size={24} />
        </span>
        {badge && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.bg} ${tone.text}`}>
            {badge}
          </span>
        )}
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{product.brand}</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{product.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{product.tagline}</p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {product.highlights.slice(0, 4).map((highlight) => (
          <li key={highlight} className="flex items-start gap-2.5 text-sm leading-6 text-slate-700">
            <CheckIcon size={16} className={`mt-0.5 shrink-0 ${accent.text}`} />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href={product.learnMoreHref}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Learn More
          <ArrowRightIcon size={14} />
        </Link>
        <Link
          href={product.bookDemoHref}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Book Demo
        </Link>
      </div>
    </article>
  );
}
