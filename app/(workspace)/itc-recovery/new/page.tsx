import Link from 'next/link';
import { createItcReturnRecord } from '../actions';

export const metadata = {
  title: 'Add Return Record | ITC Recovery | Oxiom',
};

export default async function NewItcReturnRecordPage({ searchParams }: Readonly<{ searchParams: Promise<{ error?: string }> }>) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/itc-recovery" className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline">
        ← Back to ITC Recovery
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-950">Add a filed-return record</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter one line exactly as it appears in your filed GST return (GSTR-2A/2B). It will be matched against your purchase invoices by vendor GSTIN and invoice number.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error === 'invalid' ? 'Please fill in all required fields with valid values.' : 'Something went wrong saving that record.'}
        </div>
      )}

      <form action={createItcReturnRecord} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-slate-800">Vendor GSTIN</span>
          <input name="vendorGstin" required maxLength={20} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="27AAECM1234F1Z5" />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-slate-800">Vendor name</span>
          <input name="vendorName" required maxLength={200} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="As it appears on the return" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Return invoice number</span>
          <input name="returnInvoiceNumber" required maxLength={100} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. MO-8841" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Return period</span>
          <input name="returnPeriod" required maxLength={20} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. 2026-06" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Invoice date</span>
          <input name="invoiceDate" type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Currency</span>
          <select name="currency" defaultValue="INR" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Taxable value</span>
          <input name="taxableValue" type="number" min="0" step="0.01" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Tax amount</span>
          <input name="taxAmount" type="number" min="0" step="0.01" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Save return record
          </button>
        </div>
      </form>
    </div>
  );
}
