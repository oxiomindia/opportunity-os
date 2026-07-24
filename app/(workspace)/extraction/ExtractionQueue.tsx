'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatInvoiceDate } from '../../../lib/invoiceFormatters';
import { useExtraction } from '../../components/ExtractionProvider';
import { ExtractionConfidenceBadge, ExtractionStatusBadge } from './ExtractionBadges';
import ExtractionEmptyState from './ExtractionEmptyState';
import ExtractionFilters, { type ExtractionFiltersValue } from './ExtractionFilters';
import ExtractionProgress from './ExtractionProgress';
import ExtractionSessionNotice from './ExtractionSessionNotice';

const emptyFilters: ExtractionFiltersValue = { search: '', status: 'all', confidence: 'all' };
type SortKey = 'invoice' | 'confidence' | 'issues' | 'processed';

function confidenceMatches(confidence: number, filter: ExtractionFiltersValue['confidence']) {
  if (filter === 'high') return confidence >= 90;
  if (filter === 'medium') return confidence >= 70 && confidence < 90;
  if (filter === 'low') return confidence < 70;
  return true;
}

export default function ExtractionQueue() {
  const { queueItems, startExtraction, retryExtraction, reprocessExtraction, resetExtraction, cancelExtraction } = useExtraction();
  const [filters, setFilters] = useState(emptyFilters);
  const [sortKey, setSortKey] = useState<SortKey>('processed');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const hasFilters = filters.search.trim() !== '' || filters.status !== 'all' || filters.confidence !== 'all';
  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return queueItems
      .filter((item) => filters.status === 'all' || item.status === filters.status)
      .filter((item) => confidenceMatches(item.overallConfidence, filters.confidence))
      .filter((item) => !search || `${item.invoice.invoiceNumber} ${item.invoice.vendorName} ${item.invoice.fileName}`.toLowerCase().includes(search))
      .sort((a, b) => {
        if (sortKey === 'confidence') return b.overallConfidence - a.overallConfidence;
        if (sortKey === 'issues') return b.issueCount - a.issueCount;
        if (sortKey === 'invoice') return a.invoice.invoiceNumber.localeCompare(b.invoice.invoiceNumber);
        return (b.lastProcessedAt ?? '').localeCompare(a.lastProcessedAt ?? '');
      });
  }, [filters, queueItems, sortKey]);
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice((Math.min(page, pageCount) - 1) * pageSize, Math.min(page, pageCount) * pageSize);

  function updateFilters(next: ExtractionFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Local extraction simulation</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Extraction Queue</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Start deterministic browser-only extraction simulations for mock invoices and temporary uploaded intake records. No request leaves the browser.</p>
          </div>
          <Link href="/upload" className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700">Upload invoices</Link>
        </div>
      </section>
      <ExtractionSessionNotice />
      <section className="grid gap-3 md:grid-cols-4" aria-label="Extraction summary">
        {[
          ['Total records', queueItems.length],
          ['Processing', queueItems.filter((item) => item.status === 'processing').length],
          ['Needs review', queueItems.filter((item) => item.status === 'needs-review').length],
          ['Failed', queueItems.filter((item) => item.status === 'failed').length],
        ].map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></article>)}
      </section>
      <ExtractionFilters value={filters} onChange={updateFilters} onClear={() => updateFilters(emptyFilters)} hasFilters={hasFilters} />
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Extractable records</h2>
            <p className="text-sm text-slate-600">{filteredItems.length} records match the current view.</p>
          </div>
          <label className="text-sm font-medium text-slate-700">Sort queue
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="ml-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="processed">Last processed</option>
              <option value="invoice">Invoice number</option>
              <option value="confidence">Confidence</option>
              <option value="issues">Issue count</option>
            </select>
          </label>
        </div>
        {visibleItems.length === 0 ? <div className="p-4"><ExtractionEmptyState hasFilters={hasFilters} /></div> : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full divide-y divide-slate-200 text-sm">
              <caption className="sr-only">Extraction queue with status, confidence, issues, and actions</caption>
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Document</th><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Confidence</th><th className="px-4 py-3">Last processed</th><th className="px-4 py-3">Issues</th><th className="px-4 py-3">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleItems.map((item) => (
                  <tr key={item.invoice.id} className="align-top">
                    <td className="px-4 py-4"><Link className="font-semibold text-blue-700 hover:underline" href={`/extraction/${item.invoice.id}`}>{item.invoice.invoiceNumber}</Link><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{item.invoice.fileName}</p></td>
                    <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.invoice.vendorName}</p><p className="text-xs text-slate-500">{item.invoice.vendorEmail ?? 'No vendor email'}</p></td>
                    <td className="px-4 py-4 capitalize text-slate-700">{item.invoice.source.replace('-', ' ')}</td>
                    <td className="px-4 py-4"><ExtractionStatusBadge status={item.status} />{item.result?.status === 'processing' && <div className="mt-3 min-w-48"><ExtractionProgress stage={item.result.stage} progress={item.result.progress} /></div>}</td>
                    <td className="px-4 py-4"><ExtractionConfidenceBadge confidence={item.overallConfidence} /></td>
                    <td className="px-4 py-4 text-slate-700">{item.lastProcessedAt ? formatInvoiceDate(item.lastProcessedAt) : 'Not processed'}</td>
                    <td className="px-4 py-4 text-slate-700">{item.issueCount} issues</td>
                    <td className="px-4 py-4"><div className="flex flex-wrap gap-2">
                      {item.status === 'processing' ? <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700" onClick={() => cancelExtraction(item.invoice)} aria-label={`Cancel extraction for ${item.invoice.invoiceNumber}`}>Cancel</button> : <button type="button" className="rounded-lg border border-blue-200 px-3 py-2 font-semibold text-blue-700" onClick={() => (item.status === 'failed' ? retryExtraction(item.invoice) : startExtraction(item.invoice))} aria-label={`${item.status === 'failed' ? 'Retry failed extraction' : 'Start extraction'} for ${item.invoice.invoiceNumber}`}>{item.status === 'failed' ? 'Retry Failed' : 'Start Extraction'}</button>}
                      <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700" onClick={() => reprocessExtraction(item.invoice)} aria-label={`Reprocess ${item.invoice.invoiceNumber}`}>Reprocess</button>
                      <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700" onClick={() => resetExtraction(item.invoice)} aria-label={`Reset result for ${item.invoice.invoiceNumber}`}>Reset Result</button>
                      <Link className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white" href={`/extraction/${item.invoice.id}`}>Open Result</Link>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">Page {Math.min(page, pageCount)} of {pageCount}</p>
          <div className="flex gap-2"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50">Previous</button><button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50">Next</button></div>
        </div>
      </section>
    </div>
  );
}
