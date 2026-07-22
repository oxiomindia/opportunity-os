'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, Bell } from './Icons';
import { notifications } from '../data/mockData';

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="relative w-80">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon size={16} />
        </span>
        <input
          type="text"
          placeholder="Search opportunities, agents, reports..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-12 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-400 font-medium">
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-[360px] bg-white border border-slate-200 rounded-xl shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                <span className="text-[13px] font-semibold text-slate-900">Notifications</span>
                <button className="text-xs font-medium text-blue-600 hover:underline bg-transparent border-none cursor-pointer">
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors ${
                      n.unread ? 'bg-blue-50/50' : ''
                    } hover:bg-slate-50`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-blue-600' : 'bg-transparent'}`} />
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-3 pr-1 py-1 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
          <span className="text-[13px] font-medium text-slate-900">Alex Chen</span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-[11px] font-bold">
            AC
          </div>
        </div>
      </div>
    </header>
  );
}