'use client';

import React from 'react';

type BadgeTone = 'idle' | 'running' | 'complete' | 'High' | 'Medium' | 'Low';

interface BadgeProps {
  children: React.ReactNode;
  type?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  idle: 'bg-slate-100 text-slate-600',
  running: 'bg-blue-100 text-blue-700',
  complete: 'bg-emerald-100 text-emerald-700',
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-100 text-slate-600',
};

export default function Badge({ children, type = 'idle' }: BadgeProps) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${toneClasses[type]}`}>
      {children}
    </span>
  );
}
