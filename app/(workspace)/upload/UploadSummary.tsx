import type { UploadQueueItem } from '../../../types/upload';

export default function UploadSummary({ items }: Readonly<{ items: UploadQueueItem[] }>) {
  const cards = [
    { label: 'Uploaded', value: items.filter((item) => item.status === 'Uploaded').length, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Failed', value: items.filter((item) => item.status === 'Failed').length, tone: 'bg-red-50 text-red-700' },
    { label: 'Cancelled', value: items.filter((item) => item.status === 'Cancelled').length, tone: 'bg-amber-50 text-amber-800' },
    { label: 'Remaining', value: items.filter((item) => item.status === 'Waiting' || item.status === 'Uploading').length, tone: 'bg-blue-50 text-blue-700' },
  ];

  return (
    <section aria-labelledby="upload-summary-title" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <h2 id="upload-summary-title" className="sr-only">Upload summary</h2>
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
            </div>
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${card.tone}`} aria-hidden="true">□</span>
          </div>
        </article>
      ))}
    </section>
  );
}
