'use client';

import React from 'react';
import Select from './Select';
import Input from './Input';
import Button from './Button';
import { Bot, SearchIcon, Globe, Layers, Play } from './Icons';
import { agents, countries, depthOptions } from '../../data/mockData';

interface ResearchPanelProps {
  agent: string;
  setAgent: (v: string) => void;
  keyword: string;
  setKeyword: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  depth: string;
  setDepth: (v: string) => void;
  isRunning: boolean;
  onRun: () => void;
}

export default function ResearchPanel({
  agent, setAgent, keyword, setKeyword, country, setCountry, depth, setDepth, isRunning, onRun
}: ResearchPanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <SearchIcon size={18} className="text-slate-500" />
        <h2 className="text-[15px] font-semibold text-slate-900">Research Configuration</h2>
      </div>

      <div className="flex flex-col gap-3.5">
        <Select
          value={agent}
          onChange={setAgent}
          options={agents.map(a => ({ value: a.id, label: a.name }))}
          placeholder="Select Agent"
          icon={<Bot size={16} />}
        />
        <Input
          value={keyword}
          onChange={setKeyword}
          placeholder="Enter keywords (e.g. developer tools, CI/CD)"
          icon={<SearchIcon size={16} />}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={country}
            onChange={setCountry}
            options={countries.map(c => ({ value: c.code, label: c.name }))}
            placeholder="Country"
            icon={<Globe size={16} />}
          />
          <Select
            value={depth}
            onChange={setDepth}
            options={depthOptions}
            placeholder="Search Depth"
            icon={<Layers size={16} />}
          />
        </div>
        <Button
          onClick={onRun}
          disabled={isRunning || !keyword.trim()}
          icon={<Play size={16} />}
          fullWidth
        >
          {isRunning ? 'Running Research...' : 'Run Research'}
        </Button>
      </div>
    </div>
  );
}