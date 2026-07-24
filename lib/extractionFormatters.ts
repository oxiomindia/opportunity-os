import type { ExtractionConfidenceCategory, ExtractionIssueSeverity, ExtractionQueueStatus, ExtractionStage } from '../types/extraction';

export function getExtractionStatusLabel(status: ExtractionQueueStatus) {
  const labels: Record<ExtractionQueueStatus, string> = {
    'not-started': 'Not Started',
    processing: 'Processing',
    extracted: 'Extracted',
    'needs-review': 'Needs Review',
    failed: 'Failed',
  };
  return labels[status];
}

export function getConfidenceCategory(confidence: number): ExtractionConfidenceCategory {
  if (confidence >= 90) return 'High';
  if (confidence >= 70) return 'Medium';
  return 'Low';
}

export function formatConfidence(confidence: number) {
  return `${getConfidenceCategory(confidence)} confidence (${confidence}%)`;
}

export function getExtractionStatusClasses(status: ExtractionQueueStatus) {
  const classes: Record<ExtractionQueueStatus, string> = {
    'not-started': 'border-slate-200 bg-slate-50 text-slate-700',
    processing: 'border-blue-200 bg-blue-50 text-blue-800',
    extracted: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    'needs-review': 'border-amber-200 bg-amber-50 text-amber-900',
    failed: 'border-red-200 bg-red-50 text-red-800',
  };
  return classes[status];
}

export function getConfidenceClasses(confidence: number) {
  const category = getConfidenceCategory(confidence);
  if (category === 'High') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (category === 'Medium') return 'border-amber-200 bg-amber-50 text-amber-900';
  return 'border-red-200 bg-red-50 text-red-800';
}

export function getIssueSeverityClasses(severity: ExtractionIssueSeverity) {
  const classes: Record<ExtractionIssueSeverity, string> = {
    Info: 'border-blue-200 bg-blue-50 text-blue-800',
    Warning: 'border-amber-200 bg-amber-50 text-amber-900',
    Error: 'border-red-200 bg-red-50 text-red-800',
  };
  return classes[severity];
}

export function getStageProgress(stage: ExtractionStage) {
  const progress: Record<ExtractionStage, number> = {
    Queued: 5,
    'Reading Document': 28,
    'Detecting Fields': 58,
    'Validating Values': 82,
    Complete: 100,
  };
  return progress[stage];
}
