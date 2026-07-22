'use client';

import React from 'react';
import { iconMap } from './Icons';
import { KPIData } from '../types';

export default function KPICard({ data }: { data: KPIData }) {
  const Icon = iconMap[data.iconName];
  
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  };

  const c = colorMap[data.color];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-500">{data.title}</span>
        <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="text-[28px] font-bold text-slate-900 tracking-tight">{data.value}</span>
        {data.change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
            data.changeType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {data.changeType === 'up' ? '+' : ''}{data.change}
          </span>
        )}
      </div>
    </div>
  );
}