import type { AcceptedUploadMimeType, TemporaryIntakeRecord, UploadQueueItem, UploadValidationError } from '../../../types/upload';
import { acceptedUploadMimeTypes } from '../../../types/upload';
import { maxUploadBatchSize, maxUploadFileSizeBytes } from './uploadConstants';

function isAcceptedMimeType(mimeType: string): mimeType is AcceptedUploadMimeType {
  return acceptedUploadMimeTypes.includes(mimeType as AcceptedUploadMimeType);
}

function hasAcceptedExtension(filename: string) {
  const normalized = filename.toLowerCase();
  return normalized.endsWith('.pdf') || normalized.endsWith('.png') || normalized.endsWith('.jpg') || normalized.endsWith('.jpeg');
}

export function formatUploadFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function getUploadFileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.startsWith('image/')) return 'IMG';
  return 'FILE';
}

export function validateUploadFiles(files: File[], currentItems: UploadQueueItem[]) {
  const errors: UploadValidationError[] = [];
  const validFiles: File[] = [];
  const existingNames = new Set(currentItems.map((item) => item.filename.toLowerCase()));
  const incomingNames = new Set<string>();

  if (currentItems.length + files.length > maxUploadBatchSize) {
    errors.push({
      id: 'batch-size',
      filename: 'Batch limit',
      message: `Upload up to ${maxUploadBatchSize} files at a time. Remove files before adding more.`,
    });
  }

  files.forEach((file) => {
    const normalizedName = file.name.toLowerCase();
    if (existingNames.has(normalizedName) || incomingNames.has(normalizedName)) {
      errors.push({ id: `${file.name}-duplicate`, filename: file.name, message: 'Duplicate filenames are not allowed in the same upload session.' });
      return;
    }
    incomingNames.add(normalizedName);

    if (file.size === 0) {
      errors.push({ id: `${file.name}-empty`, filename: file.name, message: 'Empty files cannot be uploaded.' });
      return;
    }

    if (file.size > maxUploadFileSizeBytes) {
      errors.push({ id: `${file.name}-size`, filename: file.name, message: 'File exceeds the 25 MB limit.' });
      return;
    }

    if (!isAcceptedMimeType(file.type) && !hasAcceptedExtension(file.name)) {
      errors.push({ id: `${file.name}-type`, filename: file.name, message: 'Only PDF, PNG, JPG, and JPEG files are supported.' });
      return;
    }

    validFiles.push(file);
  });

  return { validFiles, errors };
}

export function createUploadQueueItem(file: File, sequence: number): UploadQueueItem {
  return {
    id: `upload-${sequence}-${file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    file,
    filename: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    status: 'Waiting',
    progress: 0,
    attempt: 0,
  };
}

export function shouldFailDeterministically(item: UploadQueueItem) {
  return item.filename.toLowerCase().includes('fail') && item.attempt === 0;
}

export function createTemporaryIntakeRecord(item: UploadQueueItem): TemporaryIntakeRecord {
  return {
    id: `temp-${item.id}`,
    filename: item.filename,
    size: item.size,
    mimeType: item.mimeType,
    uploadedAt: item.uploadedAt ?? new Date().toISOString(),
    status: 'received',
    source: 'manual-upload',
  };
}
