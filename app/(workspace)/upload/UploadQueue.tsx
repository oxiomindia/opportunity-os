import type { UploadQueueItem } from '../../../types/upload';
import UploadEmptyState from './UploadEmptyState';
import UploadRow from './UploadRow';

interface UploadQueueProps {
  items: UploadQueueItem[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function UploadQueue({ items, onPause, onResume, onCancel, onRetry, onRemove }: Readonly<UploadQueueProps>) {
  if (items.length === 0) return <UploadEmptyState />;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-labelledby="upload-queue-title">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 id="upload-queue-title" className="text-base font-semibold text-slate-950">Upload queue</h2>
        <p className="mt-1 text-sm text-slate-500">Progress is simulated locally. Uploaded documents become temporary received invoices.</p>
      </div>
      <ul>
        {items.map((item) => (
          <UploadRow key={item.id} item={item} onPause={onPause} onResume={onResume} onCancel={onCancel} onRetry={onRetry} onRemove={onRemove} />
        ))}
      </ul>
    </section>
  );
}
