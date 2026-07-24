'use client';

import { useRef, useState } from 'react';
import { maxUploadBatchSize, maxUploadFileSizeBytes, uploadAcceptAttribute } from './uploadConstants';
import { formatUploadFileSize } from './uploadUtils';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function UploadDropzone({ onFilesSelected }: Readonly<UploadDropzoneProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    onFilesSelected(Array.from(fileList));
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <section aria-labelledby="upload-dropzone-title" className="rounded-xl border border-slate-200 bg-white p-5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center outline-none transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
        }`}
        aria-describedby="upload-dropzone-help"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-semibold text-white" aria-hidden="true">
          ↑
        </div>
        <h2 id="upload-dropzone-title" className="mt-5 text-xl font-semibold tracking-tight text-slate-950">Upload invoices</h2>
        <p id="upload-dropzone-help" className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Drag and drop PDF, PNG, JPG, or JPEG files here, or press Enter to browse. You can upload up to {maxUploadBatchSize} files per batch, {formatUploadFileSize(maxUploadFileSizeBytes)} each.
        </p>
        <span className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Browse files</span>
        <input ref={inputRef} type="file" multiple accept={uploadAcceptAttribute} className="sr-only" onChange={(event) => handleFiles(event.target.files)} aria-label="Browse invoice files" />
      </div>
    </section>
  );
}
