'use client';

import { useState, useCallback, useRef } from 'react';
import { mockLogs, mockResults } from '../data/mockData';
import { OpportunityResult } from '../types';

export function useResearch() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<OpportunityResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runResearch = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    setStatus('running');
    setProgress(0);
    setLogs([]);
    setResults([]);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      const progressPct = Math.min((step / mockLogs.length) * 100, 100);
      setProgress(progressPct);
      setLogs(prev => [...prev, mockLogs[step - 1]]);

      if (step >= mockLogs.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setStatus('complete');
        setResults(mockResults);
      }
    }, 400);
  }, [isRunning]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setStatus('idle');
    setProgress(0);
    setLogs([]);
    setResults([]);
  }, []);

  return {
    isRunning,
    progress,
    logs,
    results,
    status,
    runResearch,
    reset,
  };
}