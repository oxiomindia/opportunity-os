'use client';

import { useCallback } from 'react';
import { useInvoiceIntake } from '../../components/InvoiceIntakeProvider';
import UploadDropzone from './UploadDropzone';
import UploadQueue from './UploadQueue';
import UploadSummary from './UploadSummary';
import UploadToolbar from './UploadToolbar';
import { useUploadManager } from './useUploadManager';

export default function UploadPageClient() {
  const { addIntakeRecords } = useInvoiceIntake();
  const handleComplete = useCallback((records: Parameters<typeof addIntakeRecords>[0]) => addIntakeRecords(records), [addIntakeRecords]);
  const uploadManager = useUploadManager(handleComplete);

  return (
    <div className="flex flex-col gap-5">
      <UploadToolbar items={uploadManager.items} errors={uploadManager.errors} onClearErrors={uploadManager.clearErrors} onClearFinished={uploadManager.clearFinished} />
      <UploadSummary items={uploadManager.items} />
      <UploadDropzone onFilesSelected={uploadManager.addFiles} />
      <UploadQueue
        items={uploadManager.items}
        onPause={uploadManager.pause}
        onResume={uploadManager.resume}
        onCancel={uploadManager.cancel}
        onRetry={uploadManager.retry}
        onRemove={uploadManager.remove}
      />
    </div>
  );
}
