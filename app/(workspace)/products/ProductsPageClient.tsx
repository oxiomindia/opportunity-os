'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { ProductService } from '../../../types/productService';
import { createProductService } from './actions';

const errorMessages: Record<string, string> = {
  invalid: 'Name and a valid, non-negative unit price are required.',
  mutation: 'Something went wrong saving that item. Please try again.',
  'demo-read-only': 'Demo workspaces are read-only. Sign up for a real account to manage your catalog.',
};

function formatPrice(unitPrice: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(unitPrice);
}

export default function ProductsPageClient({ items }: Readonly<{ items: ProductService[] }>) {
  const [showForm, setShowForm] = useState(items.length === 0);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Products &amp; Services</h1>
          <p className="mt-1 text-sm text-slate-600">The catalog you bill customers from on invoices.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {showForm ? 'Close' : 'New item'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessages[error] ?? 'Something went wrong.'}
        </div>
      )}

      {showForm && (
        <form action={createProductService} className="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-800">Name</span>
            <input name="name" required maxLength={200} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Monthly Platform Subscription" />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-800">Description</span>
            <input name="description" maxLength={500} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Standard tier, billed monthly" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-800">SKU</span>
            <input name="sku" maxLength={64} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="SUB-STD" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-800">Unit price</span>
            <input name="unitPrice" type="number" step="0.01" min="0" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="199.00" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-800">Currency</span>
            <select name="currency" defaultValue="USD" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Save item
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No products or services yet. Add your first item to start billing for it.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-950">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Unit price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.sku ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatPrice(item.unitPrice, item.currency)}</td>
                  <td className="px-4 py-3 text-slate-600">{item.active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
