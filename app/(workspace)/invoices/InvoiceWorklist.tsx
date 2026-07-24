'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Invoice } from '../../../types/invoice';
import InvoiceBulkToolbar from './InvoiceBulkToolbar';
import InvoiceEmptyState from './InvoiceEmptyState';
import InvoiceFilters, { type InvoiceFiltersValue } from './InvoiceFilters';
import InvoicePagination from './InvoicePagination';
import InvoiceSummaryCards from './InvoiceSummaryCards';
import InvoiceTable from './InvoiceTable';
import InvoiceTableSkeleton from './InvoiceTableSkeleton';
import { filterInvoices, paginateInvoices, sortInvoices, type InvoiceSortKey, type InvoiceSortState } from './invoiceWorklistUtils';

const emptyFilters: InvoiceFiltersValue = {
  search: '',
  status: 'all',
  dateFilter: 'all',
};

const pageSize = 6;

export default function InvoiceWorklist({ invoices, isLoading = false }: Readonly<{ invoices: Invoice[]; isLoading?: boolean }>) {
  const [filters, setFilters] = useState<InvoiceFiltersValue>(emptyFilters);
  const [sort, setSort] = useState<InvoiceSortState>({ key: 'dueDate', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
  const [openMenuInvoiceId, setOpenMenuInvoiceId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');
  const hasFilters = filters.search.trim() !== '' || filters.status !== 'all' || filters.dateFilter !== 'all';

  const sortedInvoices = useMemo(() => sortInvoices(filterInvoices(invoices, filters), sort), [filters, invoices, sort]);
  const pageCount = Math.max(1, Math.ceil(sortedInvoices.length / pageSize));
  const visibleInvoices = useMemo(() => paginateInvoices(sortedInvoices, Math.min(page, pageCount), pageSize), [page, pageCount, sortedInvoices]);

  function updateFilters(nextFilters: InvoiceFiltersValue) {
    setFilters(nextFilters);
    setPage(1);
    setSelectedInvoiceIds(new Set());
    setOpenMenuInvoiceId(null);
    setActionMessage('');
  }

  function handleClearFilters() {
    updateFilters(emptyFilters);
  }

  function handleSortChange(key: InvoiceSortKey) {
    setSort((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  }

  function handleToggleInvoice(invoiceId: string) {
    setSelectedInvoiceIds((currentSelection) => {
      const nextSelection = new Set(currentSelection);
      if (nextSelection.has(invoiceId)) nextSelection.delete(invoiceId);
      else nextSelection.add(invoiceId);
      return nextSelection;
    });
    setActionMessage('');
  }

  function handleToggleVisible() {
    const visibleIds = visibleInvoices.map((invoice) => invoice.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((invoiceId) => selectedInvoiceIds.has(invoiceId));

    setSelectedInvoiceIds((currentSelection) => {
      const nextSelection = new Set(currentSelection);
      visibleIds.forEach((invoiceId) => {
        if (allVisibleSelected) nextSelection.delete(invoiceId);
        else nextSelection.add(invoiceId);
      });
      return nextSelection;
    });
    setActionMessage('');
  }

  function handlePageChange(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), pageCount));
    setOpenMenuInvoiceId(null);
  }

  function handleActionMessage(message: string) {
    setActionMessage(message);
    setOpenMenuInvoiceId(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Invoice intake</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Invoices</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Monitor invoice intake, review confidence signals, and route exceptions before invoices move into verification and payment preparation.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700" onClick={() => handleActionMessage('Export queued for the current filtered invoice worklist.')}>
              Export
            </button>
            <Link href="/upload" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Upload Invoice
            </Link>
          </div>
        </div>
        {actionMessage && selectedInvoiceIds.size === 0 && <p role="status" className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">{actionMessage}</p>}
      </section>

      <InvoiceSummaryCards invoices={invoices} />
      <InvoiceFilters value={filters} onChange={updateFilters} onClear={handleClearFilters} hasFilters={hasFilters} />
      <InvoiceBulkToolbar selectedCount={selectedInvoiceIds.size} onClearSelection={() => setSelectedInvoiceIds(new Set())} message={actionMessage} onMessage={handleActionMessage} />

      {isLoading ? (
        <InvoiceTableSkeleton />
      ) : visibleInvoices.length > 0 ? (
        <>
          <InvoiceTable
            invoices={visibleInvoices}
            selectedInvoiceIds={selectedInvoiceIds}
            sort={sort}
            onSortChange={handleSortChange}
            onToggleInvoice={handleToggleInvoice}
            onToggleVisible={handleToggleVisible}
            openMenuInvoiceId={openMenuInvoiceId}
            onToggleMenu={(invoiceId) => setOpenMenuInvoiceId((currentId) => (currentId === invoiceId ? null : invoiceId))}
            onActionMessage={handleActionMessage}
           />
          <InvoicePagination page={Math.min(page, pageCount)} pageCount={pageCount} totalCount={sortedInvoices.length} pageSize={pageSize} onPageChange={handlePageChange} />
        </>
      ) : (
        <InvoiceEmptyState hasFilters={hasFilters} />
      )}
    </div>
  );
}
