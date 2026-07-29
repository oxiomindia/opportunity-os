import Link from 'next/link';
import type { ProductCategoryDef } from '../../../lib/products/types';
import { ArrowRightIcon } from './icons';

export default function CategoryTile({
  category,
  productCount,
}: Readonly<{ category: ProductCategoryDef; productCount: number }>) {
  return (
    <Link
      href={`/platform#${category.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div>
        <h3 className="text-base font-semibold text-slate-950">{category.label}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
      </div>
      <div className="mt-5 flex items-center justify-between text-sm font-semibold text-blue-700">
        <span>{productCount} {productCount === 1 ? 'product' : 'products'}</span>
        <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
