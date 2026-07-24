'use client';

import React from 'react';
import Badge from './Badge';
import ScoreBadge from './ScoreBadge';
import { Briefcase, ExternalLink, SearchIcon } from './Icons';
import { OpportunityResult } from '../../types';

interface ResultsTableProps {
  results: OpportunityResult[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const severityOrder = { High: 3, Medium: 2, Low: 1 };
  const sorted = [...results].sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-slate-500" />
          <h2 className="text-[15px] font-semibold text-slate-900">
            Opportunity Results
          </h2>

          {results.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold">
              {results.length} found
            </span>
          )}
        </div>

        {results.length > 0 && (
          <button className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer">
            Export CSV <ChevronRight size={12} />
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <SearchIcon size={24} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            No results yet
          </p>

          <p className="text-[13px] text-slate-400 mt-1">
            Configure your research and click <strong>&quot;Run Research&quot;</strong> to discover opportunities.
          </p>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200">
                {['Source', 'Title', 'Summary', 'Severity', 'Score', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sorted.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-50 transition-colors hover:bg-slate-50 ${
                    idx % 2 === 1 ? 'bg-slate-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      {row.source}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-semibold text-slate-900">
                      {row.title}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 max-w-[300px]">
                    <span className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                      {row.summary}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <Badge type={row.severity}>{row.severity}</Badge>
                  </td>

                  <td className="px-4 py-3.5">
                    <ScoreBadge score={row.score} />
                  </td>

                  <td className="px-4 py-3.5">
                    <button className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors bg-transparent border-none cursor-pointer">
                      <ExternalLink size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ChevronRight({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}