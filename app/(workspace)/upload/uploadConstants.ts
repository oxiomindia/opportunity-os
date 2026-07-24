import { acceptedUploadMimeTypes } from '../../../types/upload';

export const maxUploadFileSizeBytes = 25 * 1024 * 1024;
export const maxUploadBatchSize = 25;
export const uploadProgressStep = 20;
export const uploadProgressIntervalMs = 260;

export const acceptedUploadExtensions = ['.pdf', '.png', '.jpg', '.jpeg'] as const;
export const uploadAcceptAttribute = [...acceptedUploadMimeTypes, ...acceptedUploadExtensions].join(',');
