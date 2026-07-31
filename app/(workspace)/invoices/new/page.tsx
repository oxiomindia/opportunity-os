import Link from 'next/link';
import { listCustomers } from '../../../../lib/customers/repository';
import { createInvoice } from '../actions';

export const metadata = {
  title: 'New Invoice | Oxiom',
};

export default async function NewInvoicePage({ searchParams }: Readonly<{ searchParams: Promise<{ error?: string }> }>) {
  const [customers, { error }] = await Promise.all([listCustomers(), searchParams]);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/invoices" className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline">
        ← Back to invoices
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-950">New invoice</h1>
      <p className="mt-1 text-sm text-slate-600">Pick a customer to start a draft invoice. You&apos;ll add line items next.</p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error === 'invalid' ? 'Please choose a customer and valid dates.' : 'Something went wrong creating that invoice.'}
        </div>
      )}

      {customers.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          You need at least one customer before creating an invoice.{' '}
          <Link href="/customers" className="font-semibold text-blue-700 hover:underline">Add a customer</Link>
        </div>
      ) : (
        <form action={createInvoice} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-800">Customer</span>
            <select name="customerId" required defaultValue="" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="" disabled>Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800">Invoice date</span>
              <input name="invoiceDate" type="date" required defaultValue={today} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800">Due date</span>
              <input name="dueDate" type="date" required defaultValue={dueDate} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
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
              Create draft invoice
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
