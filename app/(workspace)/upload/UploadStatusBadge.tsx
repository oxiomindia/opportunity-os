import type { UploadStatus } from '../../../types/upload';

const statusClasses: Record<UploadStatus, string> = {
  Waiting: 'border-slate-200 bg-slate-50 text-slate-700',
  Uploading: 'border-blue-200 bg-blue-50 text-blue-700',
  Uploaded: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Failed: 'border-red-200 bg-red-50 text-red-700',
  Cancelled: 'border-amber-200 bg-amber-50 text-amber-800',
};

export default function UploadStatusBadge({ status }: Readonly<{ status: UploadStatus }>) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}
