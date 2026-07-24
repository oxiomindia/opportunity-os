export default function UploadEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-xl text-slate-500" aria-hidden="true">□</div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">No files in the upload queue</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Add invoice documents to simulate intake. Files stay in browser state only and are never persisted.</p>
    </div>
  );
}
