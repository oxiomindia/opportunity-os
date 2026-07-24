const skeletonRows = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5'];

export default function InvoiceTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-label="Loading invoices">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="h-4 w-40 rounded bg-slate-100" />
      </div>
      <div className="divide-y divide-slate-100">
        {skeletonRows.map((row) => (
          <div key={row} className="grid grid-cols-6 gap-4 px-5 py-4">
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
