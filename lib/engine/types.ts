/**
 * Platform Engine Framework -- shared contract types.
 *
 * This module defines what "an engine" means on the Oxiom platform. It has
 * no knowledge of any specific engine (Bills, ITC Recovery, Commercial) --
 * see lib/engine/README.md for the full contract and how a new engine
 * implements it.
 */

export type EngineId = string;

/** A single, stable, machine-checkable identifier for a distinct engine
 * behavior -- e.g. 'csv-export', 'reconciliation'. Kept a plain string
 * (not a closed union) because the framework must not hardcode the set of
 * capabilities a future engine can declare. */
export type EngineCapability = string;

export type EngineStatus = 'active' | 'inactive' | 'degraded' | 'error';

export interface EngineHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  message?: string;
  checkedAt: string;
}

/** A free-form, engine-owned configuration bag. The framework does not
 * prescribe engine-specific configuration shape -- only that it exists and
 * can be validated (see BaseEngine.validateConfiguration). */
export type EngineConfiguration = Record<string, unknown>;

/** Passed to lifecycle methods so a future engine can scope work to a
 * request or tenant without the framework needing to know why. Optional and
 * unused by every engine registered in this milestone -- defined now so the
 * contract doesn't need a breaking change when the first engine needs it. */
export interface EngineContext {
  requestId?: string;
  organizationId?: string;
}

export interface EngineMetadata {
  id: EngineId;
  name: string;
  description: string;
  version: string;
  /** Other engine ids this engine reads from or otherwise depends on.
   * Declarative only in this milestone -- the framework does not enforce
   * or resolve dependency order (there is no Event Bus yet for that to
   * matter). */
  dependencies: EngineId[];
  capabilities: EngineCapability[];
  /** Human-readable description of what this engine reads, not a type
   * system -- e.g. "vendor_invoices with tax_total > 0". */
  inputs: string[];
  outputs: string[];
  /** Event names this engine would publish or react to once an Event Bus
   * exists. Declarative only -- there is no Event Bus in this milestone. */
  supportedEvents: string[];
}

export type EngineMetrics = Record<string, number | string>;

export interface EngineDiagnostics {
  health: EngineHealth;
  configuration: EngineConfiguration;
  metrics: EngineMetrics;
}

export interface EngineError {
  code: string;
  message: string;
  details?: unknown;
}

export type EngineResult<T> = { ok: true; data: T } | { ok: false; error: EngineError };
