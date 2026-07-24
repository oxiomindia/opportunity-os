import type { ExtractionStage } from '../../../types/extraction';

export default function ExtractionProgress({ stage, progress }: Readonly<{ stage: ExtractionStage; progress: number }>) {
  return (
    <div aria-live="polite" className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-900">{stage}</span>
        <span className="text-slate-600">{progress}% complete</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`Extraction progress: ${stage}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
