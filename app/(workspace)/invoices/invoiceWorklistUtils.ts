import type { DateFilter } from './InvoiceFilters';
import type { Invoice, InvoiceStatus } from '../../../types/invoice';

export type InvoiceSortKey = 'invoiceDate' | 'dueDate' | 'total';
export type InvoiceSortDirection = 'asc' | 'desc';

export interface InvoiceSortState {
  key: InvoiceSortKey;
  direction: InvoiceSortDirection;
}

const today = new Date('2026-07-24T00:00:00Z');

function getDaysUntilDue(dueDate: string) {
  const due = new Date(`${dueDate}T00:00:00Z`);
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}

export function matchesInvoiceDateFilter(invoice: Invoice, dateFilter: DateFilter) {
  const daysUntilDue = getDaysUntilDue(invoice.dueDate);

  if (dateFilter === 'due-soon') return daysUntilDue >= 0 && daysUntilDue <= 7;
  if (dateFilter === 'overdue') return daysUntilDue < 0;
  if (dateFilter === 'future') return daysUntilDue > 7;

  return true;
}

export function filterInvoices(
  invoices: Invoice[],
  filters: Readonly<{ search: string; status: 'all' | InvoiceStatus; dateFilter: DateFilter }>,
) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return invoices.filter((invoice) => {
    const matchesSearch =
      normalizedSearch === '' ||
      invoice.customerName.toLowerCase().includes(normalizedSearch) ||
      invoice.invoiceNumber.toLowerCase().includes(normalizedSearch);
    const matchesStatus = filters.status === 'all' || invoice.status === filters.status;

    return matchesSearch && matchesStatus && matchesInvoiceDateFilter(invoice, filters.dateFilter);
  });
}

export function sortInvoices(invoices: Invoice[], sort: InvoiceSortState) {
  return [...invoices].sort((first, second) => {
    const firstValue = first[sort.key];
    const secondValue = second[sort.key];
    const result = typeof firstValue === 'number'
      ? firstValue - Number(secondValue)
      : String(firstValue).localeCompare(String(secondValue));

    return sort.direction === 'asc' ? result : -result;
  });
}

export function paginateInvoices(invoices: Invoice[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return invoices.slice(start, start + pageSize);
}

export function getInvoiceById(invoices: Invoice[], id: string) {
  return invoices.find((invoice) => invoice.id === id);
}
