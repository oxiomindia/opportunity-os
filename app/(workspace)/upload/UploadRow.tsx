import type { UploadQueueItem } from '../../../types/upload';
import UploadStatusBadge from './UploadStatusBadge';
import { formatUploadFileSize, getUploadFileIcon } from './uploadUtils';

interface UploadRowProps {
  item: UploadQueueItem;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function UploadRow({ item, onPause, onResume, onCancel, onRetry, onRemove }: Readonly<UploadRowProps>) {
  const canPause = item.status === 'Uploading';
  const canResume = item.status === 'Waiting';
  const canCancel = item.status === 'Uploading' || item.status === 'Waiting';
  const canRetry = item.status === 'Failed' || item.status === 'Cancelled';
  const canRemove = item.status !== 'Uploading';

  return (
    <li className="grid gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_9rem_8rem_11rem] lg:items-center">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600" aria-hidden="true">
          {getUploadFileIcon(item.mimeType)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950" title={item.filename}>{item.filename}</p>
          <p className="mt-1 text-xs text-slate-500">{formatUploadFileSize(item.size)} · {item.mimeType || 'Unknown type'}</p>
          {item.error && <p className="mt-2 text-xs font-medium text-red-700">{item.error}</p>}
        </div>
      </div>

      <UploadStatusBadge status={item.status} />

      <div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{item.progress}%</span>
          <span className="sr-only" aria-live="polite">{item.filename} upload progress is {item.progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100" role="progressbar" aria-label={`${item.filename} upload progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}>
          <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${item.progress}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        {canPause && <button type="button" onClick={() => onPause(item.id)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700" aria-label={`Pause upload for ${item.filename}`}>Pause</button>}
        {canResume && <button type="button" onClick={() => onResume(item.id)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700" aria-label={`Resume upload for ${item.filename}`}>Resume</button>}
        {canCancel && <button type="button" onClick={() => onCancel(item.id)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-amber-200 hover:text-amber-700" aria-label={`Cancel upload for ${item.filename}`}>Cancel</button>}
        {canRetry && <button type="button" onClick={() => onRetry(item.id)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700" aria-label={`Retry upload for ${item.filename}`}>Retry</button>}
        {canRemove && <button type="button" onClick={() => onRemove(item.id)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-red-200 hover:text-red-700" aria-label={`Remove ${item.filename} from upload queue`}>Remove</button>}
      </div>
    </li>
  );
}
