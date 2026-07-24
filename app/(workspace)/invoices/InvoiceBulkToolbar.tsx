interface InvoiceBulkToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  message: string;
  onMessage: (message: string) => void;
}

const reviewedMessage = 'Selected invoices were marked reviewed in the workspace queue.';
const assignMessage = 'Selected invoices were routed to owner assignment.';

export default function InvoiceBulkToolbar({ selectedCount, onClearSelection, message, onMessage }: Readonly<InvoiceBulkToolbarProps>) {
  if (selectedCount === 0) return null;

  return (
    <section aria-label="Bulk invoice actions" className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-950">{selectedCount} {selectedCount === 1 ? 'invoice' : 'invoices'} selected</p>
          <p className="mt-1 text-sm text-blue-800">Use bulk actions to move selected invoices through review operations.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => onMessage(reviewedMessage)} className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">
            Mark reviewed
          </button>
          <button type="button" onClick={() => onMessage(assignMessage)} className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">
            Assign owner
          </button>
          <button type="button" onClick={onClearSelection} className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300">
            Clear selection
          </button>
        </div>
      </div>
      {message && <p role="status" className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-blue-900">{message}</p>}
    </section>
  );
}
