export default function InvoiceEmptyState({ hasFilters }: Readonly<{ hasFilters: boolean }>) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700" aria-hidden="true">
        □
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">
        {hasFilters ? 'No invoices match your filters' : 'No invoices yet'}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {hasFilters
          ? 'Try clearing filters or adjusting your search to see invoices in this worklist.'
          : 'Invoices you create will appear here.'}
      </p>
    </div>
  );
}
