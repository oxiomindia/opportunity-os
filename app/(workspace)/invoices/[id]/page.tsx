import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInvoice, getInvoiceLineItems } from '../../../../lib/invoices/repository';
import { listProductsServices } from '../../../../lib/products/repository';
import { formatInvoiceCurrency, formatInvoiceDate } from '../../../../lib/invoiceFormatters';
import InvoiceStatusBadge from '../InvoiceStatusBadge';
import { addLineItem, deleteDraftInvoice, recordPayment, sendInvoice, voidInvoice } from '../actions';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

const awaitingPaymentStatuses = new Set(['sent', 'viewed', 'partially-paid', 'overdue']);

export default async function InvoiceDetailPage({ params }: Readonly<InvoiceDetailPageProps>) {
  const { id } = await params;
  const [invoice, lineItems, products] = await Promise.all([getInvoice(id), getInvoiceLineItems(id), listProductsServices()]);

  if (!invoice) notFound();

  const isDraft = invoice.status === 'draft';
  const isAwaitingPayment = awaitingPaymentStatuses.has(invoice.status);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/invoices" className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline">
        ← Back to invoices
      </Link>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Invoice</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{invoice.invoiceNumber}</h1>
            <p className="mt-2 text-sm text-slate-600">{invoice.customerName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              Download PDF
            </a>
            {isDraft && (
              <form action={sendInvoice}>
                <input type="hidden" name="id" value={invoice.id} />
                <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Send to customer</button>
              </form>
            )}
            {isAwaitingPayment && (
              <form action={recordPayment} className="flex items-center gap-2">
                <input type="hidden" name="id" value={invoice.id} />
                <input name="amount" type="number" step="0.01" min="0.01" required placeholder="Amount" className="w-28 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:border-emerald-300">Record payment</button>
              </form>
            )}
            {invoice.status !== 'paid' && invoice.status !== 'void' && (
              <form action={voidInvoice}>
                <input type="hidden" name="id" value={invoice.id} />
                <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Void</button>
              </form>
            )}
            {isDraft && (
              <form action={deleteDraftInvoice}>
                <input type="hidden" name="id" value={invoice.id} />
                <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Delete</button>
              </form>
            )}
          </div>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Customer</p>
          <p className="mt-2 text-base font-semibold text-slate-950">{invoice.customerName}</p>
          <p className="mt-1 text-sm text-slate-500">{invoice.customerEmail ?? 'No customer email'}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Amount</p>
          <p className="mt-2 text-base font-semibold text-slate-950">{formatInvoiceCurrency(invoice.total, invoice.currency)}</p>
          <p className="mt-1 text-sm text-slate-500">Subtotal plus tax</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Dates</p>
          <p className="mt-2 text-sm text-slate-950">Issued {formatInvoiceDate(invoice.invoiceDate)}</p>
          <p className="mt-1 text-sm text-slate-500">Due {formatInvoiceDate(invoice.dueDate)}</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">Line items</h2>
        {lineItems.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No line items yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[500px] divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr>
                  <th className="py-2 font-semibold text-slate-500">Description</th>
                  <th className="py-2 font-semibold text-slate-500">Qty</th>
                  <th className="py-2 font-semibold text-slate-500">Unit price</th>
                  <th className="py-2 font-semibold text-slate-500">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-slate-900">{item.description}</td>
                    <td className="py-3 text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-slate-600">{formatInvoiceCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 font-semibold text-slate-950">{formatInvoiceCurrency(item.lineTotal, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isDraft && (
          <form action={addLineItem} className="mt-6 grid gap-3 rounded-lg border border-dashed border-slate-300 p-4 sm:grid-cols-4">
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <label className="flex flex-col gap-1 text-sm sm:col-span-4">
              <span className="font-medium text-slate-800">Product / service (optional)</span>
              <select name="productId" defaultValue="" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Custom line item</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name} — {formatInvoiceCurrency(product.unitPrice, product.currency)}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-slate-800">Description</span>
              <input name="description" required maxLength={500} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Consulting services" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800">Quantity</span>
              <input name="quantity" type="number" step="0.01" min="0.01" required defaultValue="1" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800">Unit price</span>
              <input name="unitPrice" type="number" step="0.01" min="0" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <div className="sm:col-span-4">
              <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Add line item</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
