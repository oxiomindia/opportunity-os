'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Vendor } from '../../../types/vendor';
import { createVendor } from './actions';
import EmptyState from '../../components/EmptyState';

const errorMessages: Record<string, string> = {
  invalid: 'Vendor name is required.',
  mutation: 'Something went wrong saving that vendor. Please try again.',
  'demo-read-only': 'Demo workspaces are read-only. Sign up for a real account to manage vendors.',
};

const successMessages: Record<string, string> = {
  created: 'Vendor added.',
  updated: 'Vendor updated.',
};

export default function VendorsPageClient({ vendors }: Readonly<{ vendors: Vendor[] }>) {
  const [showForm, setShowForm] = useState(vendors.length === 0);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Vendors</h1>
          <p className="mt-1 text-sm text-slate-600">The suppliers and vendors you receive and pay invoices from.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {showForm ? 'Close' : 'New vendor'}
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessages[error] ?? 'Something went wrong.'}
        </div>
      )}
      {!error && success && (
        <div role="status" className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessages[success] ?? 'Saved.'}
        </div>
      )}

      {showForm && (
        <form action={createVendor} className="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-800">Vendor name</span>
            <input name="name" required maxLength={200} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Acme Supplies Inc." />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-800">Email</span>
            <input name="email" type="email" maxLength={320} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="accounts@acmesupplies.com" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-800">Phone</span>
            <input name="phone" maxLength={32} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="+1 415 555 0100" />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-800">Address</span>
            <input name="address" maxLength={500} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="123 Market St, San Francisco, CA" />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-800">Tax identifier</span>
            <input name="taxIdentifier" maxLength={64} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="VAT / GSTIN / EIN" />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Save vendor
            </button>
          </div>
        </form>
      )}

      {vendors.length === 0 ? (
        <EmptyState icon="⚑" title="No vendors yet" description="Add your first vendor to start recording bills." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-950">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Tax ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">{vendor.name}</td>
                  <td className="px-4 py-3 text-slate-600">{vendor.email ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{vendor.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{vendor.taxIdentifier ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
