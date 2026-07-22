'use client';

import React from 'react';
import { iconMap, Zap } from './Icons';
import { sidebarItems } from '../data/mockData';

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
}

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="w-60 min-w-[240px] bg-white border-r border-slate-200 flex flex-col p-5">
      <div className="flex items-center gap-2.5 mb-8 px-1">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          O
        </div>
        <span className="text-[15px] font-bold text-slate-900 tracking-tight">Opportunity OS</span>
      </div>

      <nav className="flex-1">
        <div className="mb-2 px-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Platform</span>
        </div>
        {sidebarItems.map(item => {
          const Icon = iconMap[item.iconName];
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-3 rounded-xl bg-blue-50 border border-blue-100">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap size={16} className="text-blue-600" />
          <span className="text-xs font-semibold text-blue-600">Pro Plan</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">2,400 scans remaining this month</p>
      </div>
    </aside>
  );
}