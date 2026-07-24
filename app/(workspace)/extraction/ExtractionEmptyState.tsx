export default function ExtractionEmptyState({ hasFilters }: Readonly<{ hasFilters: boolean }>) {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-950">{hasFilters ? 'No extraction records match these filters' : 'No extractable invoices yet'}</h2>
      <p className="mt-2 text-sm text-slate-600">{hasFilters ? 'Clear filters or search for another invoice.' : 'Upload invoices or use deterministic mock invoices to begin local extraction simulation.'}</p>
    </section>
  );
}
