import Link from 'next/link';
import type { Product } from '../../../lib/products/types';
import { getProductBadge, getStatusTone, getPrimaryCtaLabel } from '../../../lib/products/types';
import { ProductIcon, CheckIcon, ArrowRightIcon } from './icons';

const categoryAccents: Record<string, { icon: string; text: string; border: string; wash: string; line: string }> = {
  'accounts-payable': {
    icon: 'bg-blue-50 text-blue-700 ring-blue-100',
    text: 'text-blue-700',
    border: 'hover:border-blue-300',
    wash: 'from-blue-50 to-white',
    line: 'bg-blue-500',
  },
  'accounts-receivable': {
    icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    text: 'text-emerald-700',
    border: 'hover:border-emerald-300',
    wash: 'from-emerald-50 to-white',
    line: 'bg-emerald-500',
  },
  'finance-suite': {
    icon: 'bg-violet-50 text-violet-700 ring-violet-100',
    text: 'text-violet-700',
    border: 'hover:border-violet-300',
    wash: 'from-violet-50 to-white',
    line: 'bg-violet-500',
  },
  'finance-compliance': {
    icon: 'bg-amber-50 text-amber-700 ring-amber-100',
    text: 'text-amber-700',
    border: 'hover:border-amber-300',
    wash: 'from-amber-50 to-white',
    line: 'bg-amber-500',
  },
};

const defaultAccent = {
  icon: 'bg-slate-100 text-slate-700 ring-slate-200',
  text: 'text-slate-700',
  border: 'hover:border-slate-300',
  wash: 'from-slate-50 to-white',
  line: 'bg-slate-500',
};

export default function ProductCard({ product }: Readonly<{ product: Product }>) {
  const accent = categoryAccents[product.categoryId] ?? defaultAccent;
  const badge = getProductBadge(product);
  const tone = getStatusTone(product.status);

  return (
    <article className={`group relative flex h-full min-h-[30rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b ${accent.wash} p-6 shadow-sm transition-all hover:-translate-y-1 ${accent.border} hover:shadow-xl`}>
      <span className={`absolute inset-x-0 top-0 h-1 ${accent.line}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.icon} ring-1`}>
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

      <div className="mt-7 grid gap-2.5">
        <Link
          href={product.trialHref}
          className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {getPrimaryCtaLabel(product.status)}
        </Link>
        <Link
          href={product.learnMoreHref}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${accent.border}`}
        >
          Learn More
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </article>
  );
}
