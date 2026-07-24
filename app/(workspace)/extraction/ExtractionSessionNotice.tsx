export default function ExtractionSessionNotice() {
  return (
    <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900" role="note">
      Changes are stored in this browser session only. This workspace uses Local extraction simulation; no real OCR, AI, storage, or backend persistence is performed.
    </p>
  );
}
