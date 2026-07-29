'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '../../../lib/products/types';
import { getProductBadge, getStatusTone } from '../../../lib/products/types';
import type { ProductPricing } from '../../../lib/pricing/catalog';
import { ProductIcon, CheckIcon } from './icons';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const categoryAccents: Record<string, { bg: string; text: string; ring: string }> = {
  'accounts-payable': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-100' },
  'accounts-receivable': { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-100' },
  'finance-suite': { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-100' },
  'finance-compliance': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-100' },
};
const defaultAccent = { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200' };

export default function PricingCards({ plans }: Readonly<{ plans: Array<{ product: Product; pricing: ProductPricing }> }>) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div>
      <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setBilling('monthly')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${billing === 'monthly' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBilling('annual')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${billing === 'annual' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
        >
          Annual
        </button>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map(({ product, pricing }) => {
          const accent = categoryAccents[product.categoryId] ?? defaultAccent;
          const badge = getProductBadge(product);
          const tone = getStatusTone(product.status);
          const price = billing === 'monthly' ? pricing.monthlyPriceInr : pricing.annualPriceInr;

          return (
            <article key={product.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.text} ring-1 ${accent.ring}`}>
                  <ProductIcon icon={product.icon} size={24} />
                </span>
                {badge && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.bg} ${tone.text}`}>{badge}</span>}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{product.brand}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{product.name}</h3>
              {pricing.addOnLabel && <p className="mt-1 text-xs font-semibold text-blue-700">{pricing.addOnLabel}</p>}

              <div className="mt-5">
                <span className="text-3xl font-semibold tracking-tight text-slate-950">{currencyFormatter.format(price)}</span>
                <span className="text-sm text-slate-500"> / {billing === 'monthly' ? 'month' : 'year'}</span>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {product.highlights.slice(0, 3).map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-sm leading-6 text-slate-700">
                    <CheckIcon size={16} className={`mt-0.5 shrink-0 ${accent.text}`} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={product.trialHref}
                className="mt-7 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Request a Free 7-Day Trial
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
