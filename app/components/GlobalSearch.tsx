'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getGlobalSearchResults } from '../../lib/globalSearch';
import type { GlobalSearchResult, SearchResultCategory } from '../../types/search';

const categoryLabels: Record<SearchResultCategory, string> = {
  navigation: 'Navigation',
  invoice: 'Invoices',
  account: 'Accounts',
  activity: 'Activity',
  report: 'Reports',
  payment: 'Payment queue',
  verification: 'Verification',
};

const categoryClasses: Record<SearchResultCategory, string> = {
  navigation: 'bg-slate-100 text-slate-700',
  invoice: 'bg-blue-50 text-blue-700',
  account: 'bg-violet-50 text-violet-700',
  activity: 'bg-cyan-50 text-cyan-700',
  report: 'bg-emerald-50 text-emerald-700',
  payment: 'bg-indigo-50 text-indigo-700',
  verification: 'bg-amber-50 text-amber-800',
};

function groupResults(results: GlobalSearchResult[]) {
  return results.reduce<Map<SearchResultCategory, GlobalSearchResult[]>>((groups, result) => {
    const current = groups.get(result.category) ?? [];
    groups.set(result.category, [...current, result]);
    return groups;
  }, new Map());
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const hasSearchError = query.toLowerCase().includes('error');
  const results = useMemo(() => {
    if (hasSearchError) return [];
    return getGlobalSearchResults(query);
  }, [hasSearchError, query]);
  const groupedResults = useMemo(() => groupResults(results), [results]);
  const error = hasSearchError && !isLoading ? 'Search could not be completed. Try a different query.' : '';

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      if (event.key === 'Escape') setIsOpen(false);
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);


  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    if (!isOpen) return undefined;
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) return;

    const timeoutId = window.setTimeout(() => setIsLoading(false), 180);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  function openSearch() {
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      setIsOpen(false);
      window.location.href = results[activeIndex].href;
    }
  }

  return (
    <div ref={panelRef} className="relative w-full max-w-xl">
      <label className="sr-only" htmlFor="global-search">
        Search invoices, accounts, activity, reports, payments, and routes
      </label>
      <button
        type="button"
        onClick={openSearch}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-500 outline-none hover:border-blue-200 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 md:h-9"
      >
        <span className="truncate">Search invoices, vendors, alerts, and reports</span>
        <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline">⌘K</kbd>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-12 z-50 w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl md:left-auto md:right-0 md:top-11">
          <div className="flex items-center gap-2 border-b border-slate-100 p-3">
            <input
              ref={inputRef}
              id="global-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
                setIsLoading(event.target.value.trim().length > 0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Try vendor, invoice number, payment, exception, report…"
              className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-controls="global-search-results"
              aria-activedescendant={results[activeIndex] ? `global-search-result-${results[activeIndex].id}` : undefined}
            />
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Close global search">Close</button>
          </div>

          <div id="global-search-results" className="max-h-[32rem] overflow-y-auto p-3" role="listbox" aria-label="Global search results">
            {!query.trim() && (
              <div className="rounded-lg bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                Start typing to search across invoices, vendor accounts, verification, payment queue, activity, reports, and workspace navigation.
              </div>
            )}

            {query.trim() && isLoading && (
              <div className="space-y-2 p-2" role="status">
                {[0, 1, 2].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
              </div>
            )}

            {error && !isLoading && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}

            {query.trim() && !isLoading && !error && results.length === 0 && (
              <div className="rounded-lg bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                No results found for <span className="font-semibold text-slate-900">{query}</span>. Try an invoice number, vendor, workflow, or report keyword.
              </div>
            )}

            {!isLoading && !error && Array.from(groupedResults.entries()).map(([category, categoryResults]) => (
              <section key={category} className="mb-4 last:mb-0">
                <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{categoryLabels[category]}</h2>
                <div className="space-y-1">
                  {categoryResults.map((result) => {
                    const absoluteIndex = results.findIndex((item) => item.id === result.id);
                    return (
                      <Link
                        key={result.id}
                        id={`global-search-result-${result.id}`}
                        href={result.href}
                        role="option"
                        aria-selected={absoluteIndex === activeIndex}
                        onClick={() => setIsOpen(false)}
                        className={`block rounded-lg border p-3 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 ${absoluteIndex === activeIndex ? 'border-blue-200 bg-blue-50/60' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-950">{result.title}</p>
                            <p className="mt-1 text-sm leading-5 text-slate-600">{result.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {result.metadata.slice(0, 4).map((item) => (
                                <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{item}</span>
                              ))}
                            </div>
                          </div>
                          <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${categoryClasses[result.category]}`}>{categoryLabels[result.category]}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
