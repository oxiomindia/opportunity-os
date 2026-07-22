'use client';

import React, { useRef, useEffect } from 'react';
import Badge from './Badge';
import ProgressBar from './ProgressBar';
import { Activity } from './Icons';

interface ExecutionPanelProps {
  status: 'idle' | 'running' | 'complete';
  progress: number;
  logs: string[];
}

export default function ExecutionPanel({ status, progress, logs }: ExecutionPanelProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const statusLabel = status === 'idle' ? 'Idle' : status === 'running' ? 'Running' : 'Complete';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-slate-500" />
          <h2 className="text-[15px] font-semibold text-slate-900">Execution Status</h2>
        </div>
        <Badge type={status}>{statusLabel}</Badge>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">Progress</span>
          <span className="text-xs font-semibold text-slate-900">{Math.round(progress)}%</span>
        </div>
        <ProgressBar progress={progress} />
      </div>

      <div className="flex-1 bg-slate-900 rounded-lg p-3 overflow-auto max-h-[220px] font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">Waiting to start research...</p>
        ) : (
          logs.map((log, i) => {
            const timestamp = log.split(']')[0] + ']';
            const message = log.split(']').slice(1).join(']');
            const isHighlight = log.includes('complete') || log.includes('Found') || log.includes('Top opportunity');
            return (
              <div key={i} className="leading-7 whitespace-nowrap">
                <span className="text-slate-600">{timestamp}</span>
                <span className={isHighlight ? 'text-emerald-400' : 'text-slate-300'}>{message}</span>
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}