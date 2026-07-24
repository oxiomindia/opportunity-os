'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { mockInvoices } from '../../data/mockInvoices';
import { createSimulatedExtractionResult, shouldExtractionFail } from '../../lib/extractionSimulation';
import { buildValidationIssues } from '../../lib/extractionValidation';
import type { ExtractedFieldKey, ExtractionActivityEntry, ExtractionQueueItem, ExtractionResult, ExtractionStage } from '../../types/extraction';
import type { Invoice } from '../../types/invoice';
import { useInvoiceIntake } from './InvoiceIntakeProvider';

interface ExtractionState {
  results: Record<string, ExtractionResult>;
}

type ExtractionAction =
  | { type: 'START'; invoice: Invoice }
  | { type: 'ADVANCE'; invoice: Invoice; stage: ExtractionStage; progress: number }
  | { type: 'COMPLETE'; invoice: Invoice }
  | { type: 'CANCEL'; invoice: Invoice }
  | { type: 'RESET'; invoice: Invoice }
  | { type: 'UPDATE_FIELD'; invoice: Invoice; key: ExtractedFieldKey; value: string }
  | { type: 'REVIEW_FIELD'; invoice: Invoice; key: ExtractedFieldKey; reviewStatus: 'Accepted' | 'Rejected' }
  | { type: 'RESET_FIELD'; invoice: Invoice; key: ExtractedFieldKey };

interface ExtractionContextValue {
  invoices: Invoice[];
  queueItems: ExtractionQueueItem[];
  getResult: (invoiceId: string) => ExtractionResult | undefined;
  getInvoice: (invoiceId: string) => Invoice | undefined;
  startExtraction: (invoice: Invoice) => void;
  retryExtraction: (invoice: Invoice) => void;
  reprocessExtraction: (invoice: Invoice) => void;
  cancelExtraction: (invoice: Invoice) => void;
  resetExtraction: (invoice: Invoice) => void;
  updateField: (invoice: Invoice, key: ExtractedFieldKey, value: string) => void;
  reviewField: (invoice: Invoice, key: ExtractedFieldKey, reviewStatus: 'Accepted' | 'Rejected') => void;
  resetField: (invoice: Invoice, key: ExtractedFieldKey) => void;
}

const ExtractionContext = createContext<ExtractionContextValue | null>(null);
const stageSequence: Array<{ stage: ExtractionStage; progress: number }> = [
  { stage: 'Queued', progress: 5 },
  { stage: 'Reading Document', progress: 28 },
  { stage: 'Detecting Fields', progress: 58 },
  { stage: 'Validating Values', progress: 82 },
  { stage: 'Complete', progress: 100 },
];
const fixedTime = '2026-07-24T09:30:00Z';

function activity(invoice: Invoice, message: string): ExtractionActivityEntry {
  return { id: `${invoice.id}-${message.replace(/\W+/g, '-').toLowerCase()}-${fixedTime}`, at: fixedTime, message };
}

function ensureResult(invoice: Invoice, results: Record<string, ExtractionResult>) {
  return results[invoice.id] ?? createSimulatedExtractionResult(invoice, fixedTime);
}

function rebuildIssues(result: ExtractionResult): ExtractionResult {
  const values = Object.fromEntries(Object.entries(result.fields).map(([key, field]) => [key, field.value])) as Record<ExtractedFieldKey, string>;
  const issues = buildValidationIssues(values, result.lineItems);
  const fieldIssues = Object.values(result.fields)
    .filter((field) => field.confidence < 70 || field.reviewStatus === 'Rejected')
    .map((field) => ({ id: `field-${field.key}`, severity: field.reviewStatus === 'Rejected' ? 'Error' as const : 'Warning' as const, fieldKey: field.key, message: field.reviewStatus === 'Rejected' ? `${field.label} was rejected by the reviewer.` : `${field.label} has low confidence (${field.confidence}%).` }));
  const nextIssues = [...issues, ...fieldIssues];
  return { ...result, issues: nextIssues, status: nextIssues.some((item) => item.severity !== 'Info') ? 'needs-review' : 'extracted' };
}

function reducer(state: ExtractionState, action: ExtractionAction): ExtractionState {
  if (action.type === 'START') {
    const baseResult = ensureResult(action.invoice, state.results);
    return {
      results: {
        ...state.results,
        [action.invoice.id]: {
          ...baseResult,
          status: 'processing',
          stage: 'Queued',
          progress: 5,
          activity: [activity(action.invoice, 'Started local extraction simulation.'), ...baseResult.activity],
        },
      },
    };
  }
  if (action.type === 'ADVANCE') {
    const current = ensureResult(action.invoice, state.results);
    return { results: { ...state.results, [action.invoice.id]: { ...current, status: 'processing', stage: action.stage, progress: action.progress } } };
  }
  if (action.type === 'COMPLETE') {
    const result = createSimulatedExtractionResult(action.invoice, fixedTime);
    return { results: { ...state.results, [action.invoice.id]: { ...result, activity: [activity(action.invoice, 'Completed deterministic local extraction simulation.'), ...result.activity] } } };
  }
  if (action.type === 'CANCEL') {
    const current = ensureResult(action.invoice, state.results);
    return { results: { ...state.results, [action.invoice.id]: { ...current, status: 'not-started', stage: 'Queued', progress: 0, activity: [activity(action.invoice, 'Cancelled local extraction simulation. Nothing was saved.'), ...current.activity] } } };
  }
  if (action.type === 'RESET') {
    const next = { ...state.results };
    delete next[action.invoice.id];
    return { results: next };
  }
  if (action.type === 'UPDATE_FIELD') {
    const current = ensureResult(action.invoice, state.results);
    const field = current.fields[action.key];
    const updated: ExtractionResult = {
      ...current,
      fields: { ...current.fields, [action.key]: { ...field, value: action.value, edited: action.value !== field.simulatedValue, reviewStatus: 'Corrected' } },
      activity: [activity(action.invoice, `${field.label} corrected in browser session only.`), ...current.activity],
    };
    return { results: { ...state.results, [action.invoice.id]: rebuildIssues(updated) } };
  }
  if (action.type === 'REVIEW_FIELD') {
    const current = ensureResult(action.invoice, state.results);
    const field = current.fields[action.key];
    const updated: ExtractionResult = {
      ...current,
      fields: { ...current.fields, [action.key]: { ...field, reviewStatus: action.reviewStatus } },
      activity: [activity(action.invoice, `${field.label} marked ${action.reviewStatus}.`), ...current.activity],
    };
    return { results: { ...state.results, [action.invoice.id]: rebuildIssues(updated) } };
  }
  if (action.type === 'RESET_FIELD') {
    const current = ensureResult(action.invoice, state.results);
    const field = current.fields[action.key];
    const updated: ExtractionResult = {
      ...current,
      fields: { ...current.fields, [action.key]: { ...field, value: field.simulatedValue, edited: false, reviewStatus: 'Unreviewed' } },
      activity: [activity(action.invoice, `${field.label} reset to deterministic simulated value.`), ...current.activity],
    };
    return { results: { ...state.results, [action.invoice.id]: rebuildIssues(updated) } };
  }
  return state;
}

export function ExtractionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { intakeInvoices } = useInvoiceIntake();
  const [state, dispatch] = useReducer(reducer, { results: {} });
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>[]>>(new Map());
  const invoices = useMemo(() => [...intakeInvoices, ...mockInvoices], [intakeInvoices]);

  const clearTimers = useCallback((invoiceId: string) => {
    timers.current.get(invoiceId)?.forEach((timer) => clearTimeout(timer));
    timers.current.delete(invoiceId);
  }, []);

  const scheduleProcessing = useCallback((invoice: Invoice) => {
    clearTimers(invoice.id);
    dispatch({ type: 'START', invoice });
    const scheduled = stageSequence.slice(1).map((step, index) => setTimeout(() => {
      if (step.stage === 'Complete') dispatch({ type: 'COMPLETE', invoice });
      else dispatch({ type: 'ADVANCE', invoice, stage: step.stage, progress: shouldExtractionFail(invoice) && step.stage === 'Validating Values' ? 82 : step.progress });
    }, (index + 1) * 450));
    timers.current.set(invoice.id, scheduled);
  }, [clearTimers]);

  useEffect(() => () => {
    timers.current.forEach((invoiceTimers) => invoiceTimers.forEach((timer) => clearTimeout(timer)));
    timers.current.clear();
  }, []);

  const getInvoice = useCallback((invoiceId: string) => invoices.find((invoice) => invoice.id === invoiceId), [invoices]);
  const getResult = useCallback((invoiceId: string) => {
    const invoice = getInvoice(invoiceId);
    if (!invoice) return undefined;
    return state.results[invoiceId] ?? createSimulatedExtractionResult(invoice, fixedTime);
  }, [getInvoice, state.results]);

  const queueItems = useMemo<ExtractionQueueItem[]>(() => invoices.map((invoice) => {
    const result = state.results[invoice.id];
    const derived = result ?? createSimulatedExtractionResult(invoice, fixedTime);
    const status = result ? result.status : 'not-started';
    return { invoice, result, status, overallConfidence: status === 'not-started' ? invoice.confidence : derived.overallConfidence, lastProcessedAt: result?.lastProcessedAt, issueCount: status === 'not-started' ? invoice.exceptionCount : derived.issues.length };
  }), [invoices, state.results]);

  const value = useMemo<ExtractionContextValue>(() => ({
    invoices,
    queueItems,
    getResult,
    getInvoice,
    startExtraction: scheduleProcessing,
    retryExtraction: scheduleProcessing,
    reprocessExtraction: scheduleProcessing,
    cancelExtraction: (invoice) => { clearTimers(invoice.id); dispatch({ type: 'CANCEL', invoice }); },
    resetExtraction: (invoice) => { clearTimers(invoice.id); dispatch({ type: 'RESET', invoice }); },
    updateField: (invoice, key, value) => dispatch({ type: 'UPDATE_FIELD', invoice, key, value }),
    reviewField: (invoice, key, reviewStatus) => dispatch({ type: 'REVIEW_FIELD', invoice, key, reviewStatus }),
    resetField: (invoice, key) => dispatch({ type: 'RESET_FIELD', invoice, key }),
  }), [clearTimers, getInvoice, getResult, invoices, queueItems, scheduleProcessing]);

  return <ExtractionContext.Provider value={value}>{children}</ExtractionContext.Provider>;
}

export function useExtraction() {
  const context = useContext(ExtractionContext);
  if (!context) throw new Error('useExtraction must be used within ExtractionProvider');
  return context;
}
