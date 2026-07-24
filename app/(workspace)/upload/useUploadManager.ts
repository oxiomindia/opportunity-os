'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { TemporaryIntakeRecord, UploadQueueItem, UploadValidationError } from '../../../types/upload';
import { uploadProgressIntervalMs, uploadProgressStep } from './uploadConstants';
import { createTemporaryIntakeRecord, createUploadQueueItem, shouldFailDeterministically, validateUploadFiles } from './uploadUtils';

interface UploadState {
  items: UploadQueueItem[];
  errors: UploadValidationError[];
  completedRecords: TemporaryIntakeRecord[];
  sequence: number;
}

type UploadAction =
  | { type: 'ADD_FILES'; files: File[] }
  | { type: 'SET_UPLOAD_STATUS'; id: string; status: UploadQueueItem['status']; progress?: number; error?: string; uploadedAt?: string; paused?: boolean }
  | { type: 'TICK_PROGRESS'; id: string }
  | { type: 'REMOVE'; id: string }
  | { type: 'RETRY'; id: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_FINISHED' };

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  if (action.type === 'ADD_FILES') {
    const { validFiles, errors } = validateUploadFiles(action.files, state.items);
    const nextItems = validFiles.map((file, index) => createUploadQueueItem(file, state.sequence + index + 1));
    return {
      ...state,
      sequence: state.sequence + validFiles.length,
      items: [...state.items, ...nextItems],
      errors,
    };
  }

  if (action.type === 'SET_UPLOAD_STATUS') {
    let nextRecord: TemporaryIntakeRecord | null = null;
    const items = state.items.map((item) => {
      if (item.id !== action.id) return item;
      const nextItem = {
        ...item,
        status: action.status,
        progress: action.progress ?? item.progress,
        error: action.error,
        uploadedAt: action.uploadedAt ?? item.uploadedAt,
        paused: action.paused ?? false,
      };
      if (action.status === 'Uploaded') nextRecord = createTemporaryIntakeRecord(nextItem);
      return nextItem;
    });
    return {
      ...state,
      items,
      completedRecords: nextRecord ? [...state.completedRecords, nextRecord] : state.completedRecords,
    };
  }

  if (action.type === 'TICK_PROGRESS') {
    return {
      ...state,
      items: state.items.map((item) => (
        item.id === action.id ? { ...item, progress: Math.min(item.progress + uploadProgressStep, 95) } : item
      )),
    };
  }

  if (action.type === 'REMOVE') {
    return { ...state, items: state.items.filter((item) => item.id !== action.id) };
  }

  if (action.type === 'RETRY') {
    return {
      ...state,
      items: state.items.map((item) => (
        item.id === action.id ? { ...item, status: 'Waiting', progress: 0, error: undefined, attempt: item.attempt + 1, paused: false } : item
      )),
    };
  }

  if (action.type === 'CLEAR_ERRORS') return { ...state, errors: [] };
  if (action.type === 'CLEAR_FINISHED') return { ...state, items: state.items.filter((item) => item.status !== 'Uploaded' && item.status !== 'Cancelled') };

  return state;
}

export function useUploadManager(onComplete: (records: TemporaryIntakeRecord[]) => void) {
  const [state, dispatch] = useReducer(uploadReducer, { items: [], errors: [], completedRecords: [], sequence: 0 });
  const intervalIds = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const publishedRecordIds = useRef<Set<string>>(new Set());

  const stopUpload = useCallback((id: string) => {
    const intervalId = intervalIds.current.get(id);
    if (intervalId) clearInterval(intervalId);
    intervalIds.current.delete(id);
  }, []);

  const startUpload = useCallback((item: UploadQueueItem) => {
    stopUpload(item.id);
    dispatch({ type: 'SET_UPLOAD_STATUS', id: item.id, status: 'Uploading', progress: item.progress, error: undefined });

    const intervalId = setInterval(() => {
      dispatch({ type: 'TICK_PROGRESS', id: item.id });
    }, uploadProgressIntervalMs);
    intervalIds.current.set(item.id, intervalId);
  }, [stopUpload]);

  useEffect(() => {
    state.items.forEach((item) => {
      if (item.status === 'Waiting' && !item.paused) startUpload(item);
    });
  }, [startUpload, state.items]);

  useEffect(() => {
    state.items.forEach((item) => {
      if (item.status !== 'Uploading') return;
      if (item.progress >= 80 && shouldFailDeterministically(item)) {
        stopUpload(item.id);
        dispatch({ type: 'SET_UPLOAD_STATUS', id: item.id, status: 'Failed', progress: item.progress, error: 'Deterministic demo failure. Retry to continue.' });
      } else if (item.progress >= 95) {
        stopUpload(item.id);
        dispatch({ type: 'SET_UPLOAD_STATUS', id: item.id, status: 'Uploaded', progress: 100, uploadedAt: new Date().toISOString() });
      }
    });
  }, [state.items, stopUpload]);

  useEffect(() => {
    const newRecords = state.completedRecords.filter((record) => !publishedRecordIds.current.has(record.id));
    if (newRecords.length === 0) return;
    newRecords.forEach((record) => publishedRecordIds.current.add(record.id));
    onComplete(newRecords);
  }, [onComplete, state.completedRecords]);

  useEffect(() => () => {
    intervalIds.current.forEach((intervalId) => clearInterval(intervalId));
    intervalIds.current.clear();
  }, []);

  function addFiles(files: File[]) {
    dispatch({ type: 'ADD_FILES', files });
  }

  function pause(id: string) {
    stopUpload(id);
    const item = state.items.find((queueItem) => queueItem.id === id);
    if (item?.status === 'Uploading') dispatch({ type: 'SET_UPLOAD_STATUS', id, status: 'Waiting', progress: item.progress, paused: true });
  }

  function resume(id: string) {
    const item = state.items.find((queueItem) => queueItem.id === id);
    if (item && item.status === 'Waiting') dispatch({ type: 'SET_UPLOAD_STATUS', id, status: 'Waiting', progress: item.progress, paused: false });
  }

  function cancel(id: string) {
    stopUpload(id);
    dispatch({ type: 'SET_UPLOAD_STATUS', id, status: 'Cancelled' });
  }

  function retry(id: string) {
    stopUpload(id);
    dispatch({ type: 'RETRY', id });
  }

  function remove(id: string) {
    stopUpload(id);
    dispatch({ type: 'REMOVE', id });
  }

  return {
    ...state,
    addFiles,
    pause,
    resume,
    cancel,
    retry,
    remove,
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' }),
    clearFinished: () => dispatch({ type: 'CLEAR_FINISHED' }),
  };
}
