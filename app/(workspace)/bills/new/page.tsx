import Link from 'next/link';
import { listVendors } from '../../../../lib/vendors/repository';
import { createBill } from '../actions';

export const metadata = {
  title: 'New Bill | Oxiom',
};

export default async function NewBillPage({ searchParams }: Readonly<{ searchParams: Promise<{ error?: string }> }>) {
  const [vendors, { error }] = await Promise.all([listVendors(), searchParams]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/bills" className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline">
        ← Back to bills
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-950">New bill</h1>
      <p className="mt-1 text-sm text-slate-600">Pick a vendor to start a draft bill. You&apos;ll add line items and the vendor&apos;s invoice number next.</p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error === 'invalid' ? 'Please choose a vendor and valid dates.' : 'Something went wrong creating that bill.'}
        </div>
      )}

      {vendors.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          You need at least one vendor before recording a bill.{' '}
          <Link href="/vendors" className="font-semibold text-blue-700 hover:underline">Add a vendor</Link>
        </div>
      ) : (
        <form action={createBill} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-800">Vendor</span>
            <select name="vendorId" required defaultValue="" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="" disabled>Select a vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-800">Vendor&apos;s invoice number</span>
            <input name="vendorInvoiceNumber" maxLength={100} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. INV-4471" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800">Invoice date</span>
              <input name="invoiceDate" type="date" required defaultValue={today} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800">Due date</span>
              <input name="dueDate" type="date" required defaultValue={today} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-800">Currency</span>
            <select name="currency" defaultValue="USD" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>
            </select>
          </label>
          <div>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Create draft bill
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
