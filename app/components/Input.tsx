'use client';

import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
}

export default function Input({
  value,
  onChange,
  placeholder,
  icon,
}: InputProps) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-slate-200 rounded-lg py-2.5 pr-3 text-sm outline-none transition-colors focus:border-blue-500 ${icon ? 'pl-9' : 'pl-3'}`}
      />
    </div>
  );
}
