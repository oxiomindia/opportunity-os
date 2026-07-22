'use client';

import React from 'react';

interface ScoreBadgeProps {
  score: number;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  let color = 'text-slate-400';
  if (score >= 85) color = 'text-emerald-600';
  else if (score >= 70) color = 'text-amber-600';
  else color = 'text-red-600';

  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-[13px] font-bold ${color} bg-current/10`}>
      {score}
    </span>
  );
}