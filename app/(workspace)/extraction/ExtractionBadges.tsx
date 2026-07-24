import { formatConfidence, getConfidenceClasses, getExtractionStatusClasses, getExtractionStatusLabel, getIssueSeverityClasses } from '../../../lib/extractionFormatters';
import type { ExtractionIssueSeverity, ExtractionQueueStatus } from '../../../types/extraction';

export function ExtractionStatusBadge({ status }: Readonly<{ status: ExtractionQueueStatus }>) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getExtractionStatusClasses(status)}`}>{getExtractionStatusLabel(status)}</span>;
}

export function ExtractionConfidenceBadge({ confidence }: Readonly<{ confidence: number }>) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getConfidenceClasses(confidence)}`}>{formatConfidence(confidence)}</span>;
}

export function IssueSeverityBadge({ severity }: Readonly<{ severity: ExtractionIssueSeverity }>) {
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getIssueSeverityClasses(severity)}`}>{severity}</span>;
}
