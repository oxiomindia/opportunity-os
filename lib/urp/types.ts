/**
 * Universal Report Platform (URP) -- shared contract types.
 *
 * This module defines what "a report" means on the Oxiom platform. It has
 * no knowledge of any specific report (ITC Reconciliation or any future
 * one) -- see lib/urp/README.md for the full contract and how a new report
 * implements it.
 */

import type { EngineId } from '../engine/types';

export type ReportId = string;

/** Kept a plain string (not a closed union), same reasoning as
 * EngineCapability in the Engine Framework: the platform must not hardcode
 * the set of categories a future report can declare. */
export type ReportCategory = string;

/** Every format URP knows how to render today. Adding a future format means
 * adding one member here and one key to a report's `templates` map -- the
 * registry and generation pipeline need no changes. */
export type OutputFormat = 'html' | 'pdf' | 'markdown' | 'json' | 'csv';

export interface ReportMetadata {
  id: ReportId;
  name: string;
  description: string;
  /** Report version, not the underlying engine's version -- a report's
   * template/shape can change independently of the engine that feeds it. */
  version: string;
  category: ReportCategory;
  /** The engine (lib/engine/registry.ts id) this report's data comes from. */
  sourceEngine: EngineId;
  /** Human-readable description of the expected input, not a runtime
   * schema validator -- e.g. "period?: string (YYYY-MM)". Declarative, same
   * as EngineMetadata.inputs; validateInput below is the real check. */
  inputSchema: string;
}

export type ReportValidationResult<TInput> = { ok: true; data: TInput } | { ok: false; errors: string[] };

/** What a rendered report actually is, regardless of format. */
export interface RenderedReport {
  content: string | Buffer;
  contentType: string;
  filename: string;
}

export interface ReportTemplate<TData = unknown> {
  render(data: TData): Promise<RenderedReport> | RenderedReport;
}

/**
 * The contract every report implements. TInput is the structured input a
 * caller supplies (e.g. { period? }); TData is what loadData produces and
 * every template renders from -- one data-fetch, many output formats, so a
 * PDF and a CSV of the same report can never show different numbers.
 */
export interface ReportDefinition<TInput = unknown, TData = unknown> {
  metadata: ReportMetadata;
  validateInput(input: TInput): ReportValidationResult<TInput>;
  loadData(input: TInput): Promise<TData>;
  /** Partial by design -- a report only needs to support the formats that
   * make sense for it. supportedFormats (as seen in the registry) is
   * derived from this map's keys, not separately declared, so the two can
   * never drift apart. */
  templates: Partial<Record<OutputFormat, ReportTemplate<TData>>>;
}

/** The read-only view the Registry and Admin Console expose -- no handler
 * functions, so a UI can render this without importing rendering code. */
export interface RegisteredReport {
  metadata: ReportMetadata;
  supportedFormats: OutputFormat[];
  status: 'active';
}

/**
 * `input` is deliberately `unknown`, not generic: the registry that
 * generateReport() (lib/urp/generate.ts) looks reports up in is itself
 * type-erased (heterogeneous reports can't share one non-generic input
 * type), so a generic parameter here would be a false promise of
 * type-safety it can't actually check across that boundary. Each report's
 * own validateInput narrows and rejects a wrong shape at runtime instead.
 */
export interface GenerateReportInput {
  reportId: ReportId;
  format: OutputFormat;
  input: unknown;
  correlationId?: string;
}

export type GenerateReportResult =
  | { ok: true; reportId: ReportId; format: OutputFormat; version: string; report: RenderedReport }
  | { ok: false; reportId: ReportId; format: OutputFormat; error: string };
