import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSessionContext } from '../../../../lib/auth/dal';
import { getVendorInvoice, getVendorInvoiceLineItems, getVendorInvoiceAttachments } from '../../../../lib/vendorInvoices/repository';
import { formatVendorInvoiceCurrency, formatVendorInvoiceDate } from '../../../../lib/vendorInvoiceFormatters';
import VendorInvoiceStatusBadge from '../VendorInvoiceStatusBadge';
import {
  addLineItem, approveBill, deleteDraftBill, recordPayment, rejectBill,
  schedulePayment, submitForApproval, uploadAttachment, voidBill,
} from '../actions';

interface BillDetailPageProps {
  params: Promise<{ id: string }>;
}

const approverRoles = new Set(['owner', 'admin', 'reviewer']);
const awaitingPaymentStatuses = new Set(['approved', 'payment-scheduled', 'partially-paid']);

export default async function BillDetailPage({ params }: Readonly<BillDetailPageProps>) {
  const { id } = await params;
  const [{ role }, bill, lineItems, attachments] = await Promise.all([
    requireSessionContext(), getVendorInvoice(id), getVendorInvoiceLineItems(id), getVendorInvoiceAttachments(id),
  ]);

  if (!bill) notFound();

  const isDraft = bill.status === 'draft';
  const isPendingApproval = bill.status === 'pending-approval';
  const isApproved = bill.status === 'approved';
  const isAwaitingPayment = awaitingPaymentStatuses.has(bill.status);
  const canApprove = approverRoles.has(role);
  const canVoid = bill.status !== 'paid' && bill.status !== 'void';

  return (
    <div className="flex flex-col gap-5">
      <Link href="/bills" className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline">
        ← Back to bills
      </Link>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Bill</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{bill.vendorInvoiceNumber ?? `Draft — ${bill.id.slice(0, 8).toUpperCase()}`}</h1>
            <p className="mt-2 text-sm text-slate-600">{bill.vendorName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <VendorInvoiceStatusBadge status={bill.status} />
            {isDraft && (
              <form action={submitForApproval}>
                <input type="hidden" name="id" value={bill.id} />
                <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Submit for approval</button>
              </form>
            )}
            {isPendingApproval && canApprove && (
              <form action={approveBill}>
                <input type="hidden" name="id" value={bill.id} />
                <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Approve</button>
              </form>
            )}
            {isApproved && (
              <form action={schedulePayment} className="flex items-center gap-2">
                <input type="hidden" name="id" value={bill.id} />
                <input name="scheduledDate" type="date" required aria-label="Payment date" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                <button className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 hover:border-blue-300">Schedule payment</button>
              </form>
            )}
            {isAwaitingPayment && (
              <form action={recordPayment} className="flex items-center gap-2">
                <input type="hidden" name="id" value={bill.id} />
                <input name="amount" type="number" step="0.01" min="0.01" required placeholder="Amount" aria-label="Payment amount" className="w-28 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                <input name="reference" placeholder="Reference (optional)" aria-label="Payment reference" className="w-40 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:border-emerald-300">Record payment</button>
              </form>
            )}
            {canVoid && (
              <form action={voidBill}>
                <input type="hidden" name="id" value={bill.id} />
                <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Void</button>
              </form>
            )}
            {isDraft && (
              <form action={deleteDraftBill}>
                <input type="hidden" name="id" value={bill.id} />
                <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Delete</button>
              </form>
            )}
          </div>
        </div>

        {isPendingApproval && canApprove && (
          <form action={rejectBill} className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3">
            <input type="hidden" name="id" value={bill.id} />
            <label className="flex flex-1 items-center gap-2 text-sm">
              <span className="font-medium text-amber-900">Reject with reason</span>
              <input name="reason" required maxLength={500} placeholder="What needs to be corrected?" className="flex-1 rounded-md border border-amber-300 px-3 py-2 text-sm" />
            </label>
            <button className="rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-800 hover:border-amber-400">Reject</button>
          </form>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Vendor</p>
          <p className="mt-2 text-base font-semibold text-slate-950">{bill.vendorName}</p>
          <p className="mt-1 text-sm text-slate-500">{bill.vendorEmail ?? 'No vendor email'}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Amount</p>
          <p className="mt-2 text-base font-semibold text-slate-950">{formatVendorInvoiceCurrency(bill.total, bill.currency)}</p>
          <p className="mt-1 text-sm text-slate-500">Subtotal plus tax</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Dates</p>
          <p className="mt-2 text-sm text-slate-950">Invoice {formatVendorInvoiceDate(bill.invoiceDate)}</p>
          <p className="mt-1 text-sm text-slate-500">Due {formatVendorInvoiceDate(bill.dueDate)}</p>
          {bill.paymentScheduledDate && <p className="mt-1 text-sm text-slate-500">Payment scheduled {formatVendorInvoiceDate(bill.paymentScheduledDate)}</p>}
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
                    <td className="py-3 text-slate-600">{formatVendorInvoiceCurrency(item.unitPrice, bill.currency)}</td>
                    <td className="py-3 font-semibold text-slate-950">{formatVendorInvoiceCurrency(item.lineTotal, bill.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isDraft && (
          <form action={addLineItem} className="mt-6 grid gap-3 rounded-lg border border-dashed border-slate-300 p-4 sm:grid-cols-4">
            <input type="hidden" name="billId" value={bill.id} />
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-slate-800">Description</span>
              <input name="description" required maxLength={500} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Office supplies" />
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

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">Attachments</h2>
        {attachments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No files attached.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-900">{attachment.originalName}</span>
                <span className="text-slate-500">{Math.round(attachment.sizeBytes / 1024)} KB</span>
              </li>
            ))}
          </ul>
        )}

        {isDraft && (
          <form action={uploadAttachment} encType="multipart/form-data" className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-slate-300 p-4">
            <input type="hidden" name="billId" value={bill.id} />
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800">Attach the vendor&apos;s invoice (PDF, PNG, or JPEG, up to 25MB)</span>
              <input name="file" type="file" required accept="application/pdf,image/png,image/jpeg" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Upload</button>
          </form>
        )}
      </section>
    </div>
  );
}
