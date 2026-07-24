export const acceptedUploadMimeTypes = ['application/pdf', 'image/png', 'image/jpeg'] as const;

export type AcceptedUploadMimeType = (typeof acceptedUploadMimeTypes)[number];
export type UploadStatus = 'Waiting' | 'Uploading' | 'Uploaded' | 'Failed' | 'Cancelled';

export interface UploadQueueItem {
  id: string;
  file: File;
  filename: string;
  size: number;
  mimeType: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  attempt: number;
  uploadedAt?: string;
  paused?: boolean;
}

export interface UploadValidationError {
  id: string;
  filename: string;
  message: string;
}

export interface TemporaryIntakeRecord {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  status: 'received';
  source: 'manual-upload';
}
