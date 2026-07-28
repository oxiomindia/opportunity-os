import Link from 'next/link';
import { formatInvoiceCurrency, formatInvoiceDate } from '../../../lib/invoiceFormatters';
import type { Invoice } from '../../../types/invoice';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import type { InvoiceSortKey, InvoiceSortState } from './invoiceWorklistUtils';

interface InvoiceTableProps {
  invoices: Invoice[];
  selectedInvoiceIds: Set<string>;
  sort: InvoiceSortState;
  onSortChange: (key: InvoiceSortKey) => void;
  onToggleInvoice: (invoiceId: string) => void;
  onToggleVisible: () => void;
  openMenuInvoiceId: string | null;
  onToggleMenu: (invoiceId: string) => void;
  onActionMessage: (message: string) => void;
}

const sortableHeadings: Partial<Record<string, InvoiceSortKey>> = {
  'Invoice date': 'invoiceDate',
  'Due date': 'dueDate',
  Total: 'total',
};

const reminderMessage = 'Payment reminder queued for this customer.';
const exportMessage = 'Invoice queued for export.';

export default function InvoiceTable({
  invoices,
  selectedInvoiceIds,
  sort,
  onSortChange,
  onToggleInvoice,
  onToggleVisible,
  openMenuInvoiceId,
  onToggleMenu,
  onActionMessage,
}: Readonly<InvoiceTableProps>) {
  const allVisibleSelected = invoices.length > 0 && invoices.every((invoice) => selectedInvoiceIds.has(invoice.id));
  const someVisibleSelected = invoices.some((invoice) => selectedInvoiceIds.has(invoice.id));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Invoice worklist</h2>
          <p className="mt-1 text-sm text-slate-500">Track status, due dates, and payment progress for invoices you&apos;ve billed.</p>
        </div>
        <span className="text-sm font-medium text-slate-500">{invoices.length} shown</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] divide-y divide-slate-200">
          <caption className="sr-only">Invoice worklist with customer, due date, total, status, and action columns</caption>
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  aria-label="Select all visible invoices"
                  checked={allVisibleSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected;
                  }}
                  onChange={onToggleVisible}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {['Invoice number', 'Customer', 'Invoice date', 'Due date', 'Total', 'Status', 'Actions'].map((heading) => {
                const sortKey = sortableHeadings[heading];
                return (
                  <th key={heading} scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${heading === 'Invoice number' ? 'min-w-48' : ''}`}>
                    {sortKey ? (
                      <button type="button" onClick={() => onSortChange(sortKey)} className="inline-flex items-center gap-1 rounded text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" aria-label={`Sort by ${heading}`}>
                        {heading}
                        <span aria-hidden="true">{sort.key === sortKey ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                      </button>
                    ) : heading}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50">
                <td className="px-4 py-4 align-top">
                  <input type="checkbox" checked={selectedInvoiceIds.has(invoice.id)} onChange={() => onToggleInvoice(invoice.id)} aria-label={`Select invoice ${invoice.invoiceNumber}`} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </td>
                <td className="px-4 py-4 align-top">
                  <Link href={`/invoices/${invoice.id}`} className="font-semibold text-blue-700 hover:text-blue-800 hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="max-w-52 px-4 py-4 align-top">
                  <p className="truncate font-medium text-slate-900" title={invoice.customerName}>{invoice.customerName}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{invoice.customerEmail ?? 'No customer email'}</p>
                </td>
                <td className="px-4 py-4 align-top text-sm text-slate-600">{formatInvoiceDate(invoice.invoiceDate)}</td>
                <td className="px-4 py-4 align-top text-sm text-slate-600">{formatInvoiceDate(invoice.dueDate)}</td>
                <td className="px-4 py-4 align-top text-sm font-semibold text-slate-950">{formatInvoiceCurrency(invoice.total, invoice.currency)}</td>
                <td className="px-4 py-4 align-top"><InvoiceStatusBadge status={invoice.status} /></td>
                <td className="px-4 py-4 align-top">
                  <div className="relative flex items-center gap-2">
                    <Link href={`/invoices/${invoice.id}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700">
                      View
                    </Link>
                    <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700" aria-expanded={openMenuInvoiceId === invoice.id} aria-label={`Open actions for invoice ${invoice.invoiceNumber}`} onClick={() => onToggleMenu(invoice.id)}>
                      ⋯
                    </button>
                    {openMenuInvoiceId === invoice.id && (
                      <div className="absolute right-0 top-9 z-20 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg" role="menu" aria-label={`Actions for invoice ${invoice.invoiceNumber}`}>
                        <button type="button" role="menuitem" onClick={() => onActionMessage(reminderMessage)} className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Send reminder</button>
                        <button type="button" role="menuitem" onClick={() => onActionMessage(exportMessage)} className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Export</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
