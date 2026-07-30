import type { OutputFormat, ReportDefinition, ReportId, RegisteredReport } from './types';

/**
 * The Report Registry: a single in-process map reports register themselves
 * into, mirroring lib/engine/registry.ts. Not database-backed in this
 * milestone, for the same reason the Engine Registry isn't: prove the
 * mechanism against a real report before adding persistence.
 *
 * Self-registration, not central enumeration: this file has zero knowledge
 * of which reports exist. Each report module calls registerReport(this) at
 * module load (see lib/itcRecovery/urpReport.ts for the pattern) -- the
 * only place that enumerates report modules by name is
 * lib/urp/bootstrap.ts. Adding a future report never means touching this
 * file.
 */
const reports = new Map<ReportId, ReportDefinition<never, never>>();

export function registerReport<TInput, TData>(definition: ReportDefinition<TInput, TData>): void {
  const { id } = definition.metadata;
  if (reports.has(id)) {
    throw new Error(`Report "${id}" is already registered. Each report id must be unique.`);
  }
  if (Object.keys(definition.templates).length === 0) {
    throw new Error(`Report "${id}" must define at least one output template.`);
  }
  reports.set(id, definition as unknown as ReportDefinition<never, never>);
}

export function listReports(): RegisteredReport[] {
  return Array.from(reports.values()).map(toRegisteredReport);
}

export function getRegisteredReport(id: ReportId): RegisteredReport | undefined {
  const definition = reports.get(id);
  return definition ? toRegisteredReport(definition) : undefined;
}

/** Internal to the generation pipeline (lib/urp/generate.ts) -- callers
 * that only need to discover/display reports should use listReports() /
 * getRegisteredReport(), not this, since it exposes the report's
 * validate/load/template functions rather than a read-only description. */
export function getReportDefinition(id: ReportId): ReportDefinition<never, never> | undefined {
  return reports.get(id);
}

export function getSupportedFormats(id: ReportId): OutputFormat[] {
  const definition = reports.get(id);
  return definition ? (Object.keys(definition.templates) as OutputFormat[]) : [];
}

function toRegisteredReport(definition: ReportDefinition<never, never>): RegisteredReport {
  return {
    metadata: definition.metadata,
    supportedFormats: Object.keys(definition.templates) as OutputFormat[],
    status: 'active',
  };
}

/** Test-only: registerReport() rejects re-registering the same id, so
 * tests that construct reports fresh need a way to reset between runs. Not
 * intended for production use. */
export function clearRegistryForTests(): void {
  reports.clear();
}
