import type { ExtractionQueueStatus } from '../../../types/extraction';

export interface ExtractionFiltersValue {
  search: string;
  status: ExtractionQueueStatus | 'all';
  confidence: 'all' | 'high' | 'medium' | 'low';
}

export default function ExtractionFilters({ value, onChange, onClear, hasFilters }: Readonly<{ value: ExtractionFiltersValue; onChange: (value: ExtractionFiltersValue) => void; onClear: () => void; hasFilters: boolean }>) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4" aria-label="Search and filter extraction queue">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
        <label className="text-sm font-medium text-slate-700">
          Search extraction records
          <input value={value.search} onChange={(event) => onChange({ ...value, search: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Vendor, invoice number, or filename" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status filter
          <select value={value.status} onChange={(event) => onChange({ ...value, status: event.target.value as ExtractionFiltersValue['status'] })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="all">All statuses</option>
            <option value="not-started">Not Started</option>
            <option value="processing">Processing</option>
            <option value="extracted">Extracted</option>
            <option value="needs-review">Needs Review</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Confidence filter
          <select value={value.confidence} onChange={(event) => onChange({ ...value, confidence: event.target.value as ExtractionFiltersValue['confidence'] })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="all">All confidence</option>
            <option value="high">High 90–100</option>
            <option value="medium">Medium 70–89</option>
            <option value="low">Low below 70</option>
          </select>
        </label>
        <button type="button" onClick={onClear} disabled={!hasFilters} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Clear filters</button>
      </div>
    </section>
  );
}
