'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { TemporaryIntakeRecord, UploadQueueItem, UploadValidationError } from '../../../types/upload';
import { createUploadQueueItem, validateUploadFiles } from './uploadUtils';

interface UploadState { items: UploadQueueItem[]; errors: UploadValidationError[]; sequence: number }
type Action =
  | { type: 'ADD'; files: File[] }
  | { type: 'STATUS'; id: string; status: UploadQueueItem['status']; progress: number; error?: string; uploadedAt?: string }
  | { type: 'REMOVE'; id: string }
  | { type: 'RETRY'; id: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_FINISHED' };

function reducer(state: UploadState, action: Action): UploadState {
  if (action.type === 'ADD') {
    const { validFiles, errors } = validateUploadFiles(action.files, state.items);
    return { items: [...state.items, ...validFiles.map((file, index) => createUploadQueueItem(file, state.sequence + index + 1))], errors, sequence: state.sequence + validFiles.length };
  }
  if (action.type === 'STATUS') return { ...state, items: state.items.map((item) => item.id === action.id ? { ...item, status: action.status, progress: action.progress, error: action.error, uploadedAt: action.uploadedAt } : item) };
  if (action.type === 'REMOVE') return { ...state, items: state.items.filter((item) => item.id !== action.id) };
  if (action.type === 'RETRY') return { ...state, items: state.items.map((item) => item.id === action.id ? { ...item, status: 'Waiting', progress: 0, error: undefined, attempt: item.attempt + 1 } : item) };
  if (action.type === 'CLEAR_ERRORS') return { ...state, errors: [] };
  if (action.type === 'CLEAR_FINISHED') return { ...state, items: state.items.filter((item) => !['Uploaded', 'Cancelled'].includes(item.status)) };
  return state;
}

export function useUploadManager(onComplete: (records: TemporaryIntakeRecord[]) => void) {
  const [state, dispatch] = useReducer(reducer, { items: [], errors: [], sequence: 0 });
  const controllers = useRef(new Map<string, AbortController>());
  const started = useRef(new Set<string>());

  const upload = useCallback(async (item: UploadQueueItem) => {
    const controller = new AbortController();
    controllers.current.set(item.id, controller);
    dispatch({ type: 'STATUS', id: item.id, status: 'Uploading', progress: 15 });
    const body = new FormData();
    body.set('file', item.file);
    try {
      const response = await fetch('/api/invoices/upload', { method: 'POST', body, signal: controller.signal });
      const result = await response.json() as { ok: boolean; data?: TemporaryIntakeRecord; error?: { message?: string } };
      if (!response.ok || !result.ok || !result.data) throw new Error(result.error?.message ?? 'Upload failed.');
      dispatch({ type: 'STATUS', id: item.id, status: 'Uploaded', progress: 100, uploadedAt: result.data.uploadedAt });
      onComplete([result.data]);
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === 'AbortError';
      dispatch({ type: 'STATUS', id: item.id, status: cancelled ? 'Cancelled' : 'Failed', progress: 0, error: cancelled ? undefined : error instanceof Error ? error.message : 'Upload failed.' });
    } finally { controllers.current.delete(item.id); }
  }, [onComplete]);

  useEffect(() => {
    state.items.filter((item) => item.status === 'Waiting' && !started.current.has(item.id)).forEach((item) => {
      started.current.add(item.id); void upload(item);
    });
  }, [state.items, upload]);
  useEffect(() => () => { controllers.current.forEach((controller) => controller.abort()); }, []);

  const cancel = (id: string) => controllers.current.get(id)?.abort();
  const retry = (id: string) => { started.current.delete(id); dispatch({ type: 'RETRY', id }); };
  const remove = (id: string) => { cancel(id); started.current.delete(id); dispatch({ type: 'REMOVE', id }); };
  return {
    ...state, addFiles: (files: File[]) => dispatch({ type: 'ADD', files }),
    pause: cancel, resume: retry, cancel, retry, remove,
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' }), clearFinished: () => dispatch({ type: 'CLEAR_FINISHED' }),
  };
}
