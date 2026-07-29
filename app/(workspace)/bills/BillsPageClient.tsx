'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { VendorInvoice } from '../../../types/vendorInvoice';
import { formatVendorInvoiceCurrency, formatVendorInvoiceDate } from '../../../lib/vendorInvoiceFormatters';
import VendorInvoiceStatusBadge from './VendorInvoiceStatusBadge';

const errorMessages: Record<string, string> = {
  invalid: 'That bill could not be found.',
  mutation: 'Something went wrong. Please try again.',
  forbidden: 'Only an owner, admin, or reviewer can do that.',
  'demo-read-only': 'Demo workspaces are read-only. Sign up for a real account to manage bills.',
};

export default function BillsPageClient({ bills }: Readonly<{ bills: VendorInvoice[] }>) {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Bills</h1>
          <p className="mt-1 text-sm text-slate-600">Vendor invoices awaiting review, approval, and payment.</p>
        </div>
        <Link href="/bills/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          New bill
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessages[error] ?? 'Something went wrong.'}
        </div>
      )}

      {bills.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No bills yet. Record your first vendor invoice to start tracking what you owe.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-950">
              <tr>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Invoice #</th>
                <th className="px-4 py-3 font-semibold">Due date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-950">
                    <Link href={`/bills/${bill.id}`} className="text-blue-700 hover:text-blue-800 hover:underline">
                      {bill.vendorName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{bill.vendorInvoiceNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatVendorInvoiceDate(bill.dueDate)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-950">{formatVendorInvoiceCurrency(bill.total, bill.currency)}</td>
                  <td className="px-4 py-3"><VendorInvoiceStatusBadge status={bill.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
