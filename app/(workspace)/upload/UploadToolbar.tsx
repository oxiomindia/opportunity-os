import Link from 'next/link';
import type { UploadQueueItem, UploadValidationError } from '../../../types/upload';

interface UploadToolbarProps {
  items: UploadQueueItem[];
  errors: UploadValidationError[];
  onClearErrors: () => void;
  onClearFinished: () => void;
}

export default function UploadToolbar({ items, errors, onClearErrors, onClearFinished }: Readonly<UploadToolbarProps>) {
  const uploadedCount = items.filter((item) => item.status === 'Uploaded').length;
  const hasFinished = items.some((item) => item.status === 'Uploaded' || item.status === 'Cancelled');

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="upload-toolbar-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Document intake</p>
          <h1 id="upload-toolbar-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Upload invoices</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Simulate invoice document intake. Files are validated and converted into temporary received invoices in client state only.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" disabled={!hasFinished} onClick={onClearFinished} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Clear finished</button>
          <Link href="/invoices" className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${uploadedCount > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-500'}`} aria-disabled={uploadedCount === 0}>Review Uploaded Invoices</Link>
        </div>
      </div>
      {errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-red-800">Some files were not added</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {errors.map((error) => <li key={error.id}><span className="font-medium">{error.filename}:</span> {error.message}</li>)}
              </ul>
            </div>
            <button type="button" onClick={onClearErrors} className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700">Dismiss</button>
          </div>
        </div>
      )}
    </section>
  );
}
