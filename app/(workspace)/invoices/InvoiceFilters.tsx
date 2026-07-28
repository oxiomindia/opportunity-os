import { invoiceStatuses, type InvoiceStatus } from '../../../types/invoice';
import { getInvoiceStatusLabel } from '../../../lib/invoiceFormatters';

export type DateFilter = 'all' | 'due-soon' | 'overdue' | 'future';

export interface InvoiceFiltersValue {
  search: string;
  status: 'all' | InvoiceStatus;
  dateFilter: DateFilter;
}

interface InvoiceFiltersProps {
  value: InvoiceFiltersValue;
  onChange: (value: InvoiceFiltersValue) => void;
  onClear: () => void;
  hasFilters: boolean;
}

export default function InvoiceFilters({ value, onChange, onClear, hasFilters }: Readonly<InvoiceFiltersProps>) {
  return (
    <section aria-labelledby="invoice-filters-title" className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="invoice-search" className="text-sm font-medium text-slate-700">
            Search invoices
          </label>
          <input
            id="invoice-search"
            type="search"
            value={value.search}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="Search customer or invoice number"
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[28rem]">
          <div>
            <label htmlFor="invoice-status-filter" className="text-sm font-medium text-slate-700">
              Status filter
            </label>
            <select
              id="invoice-status-filter"
              value={value.status}
              onChange={(event) => onChange({ ...value, status: event.target.value as InvoiceFiltersValue['status'] })}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All statuses</option>
              {invoiceStatuses.map((status) => (
                <option key={status} value={status}>
                  {getInvoiceStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="invoice-date-filter" className="text-sm font-medium text-slate-700">
              Due date filter
            </label>
            <select
              id="invoice-date-filter"
              value={value.dateFilter}
              onChange={(event) => onChange({ ...value, dateFilter: event.target.value as DateFilter })}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All dates</option>
              <option value="due-soon">Due within 7 days</option>
              <option value="overdue">Overdue</option>
              <option value="future">Due later</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear filters
        </button>
      </div>
      <h2 id="invoice-filters-title" className="sr-only">
        Search and filter invoices
      </h2>
    </section>
  );
}
