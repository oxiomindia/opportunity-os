import type { BaseEngine } from './base';
import type { EngineId } from './types';

/**
 * The Engine Registry: a single in-process map engines register themselves
 * into. This is intentionally NOT a database-backed service in this
 * milestone -- per the platform architecture review's roadmap, the registry
 * starts as a static, in-process mechanism proven against real engines
 * before any persistence layer is added.
 *
 * Self-registration, not central enumeration: this file has zero knowledge
 * of which engines exist. Each engine module calls registerEngine(this) at
 * module load (see lib/itcRecovery/engine.ts for the pattern) -- the only
 * place that enumerates engine modules by name is lib/engine/bootstrap.ts,
 * whose sole job is importing them so that self-registration runs. Adding a
 * future engine never means touching this file.
 */
const engines = new Map<EngineId, BaseEngine>();

export function registerEngine(engine: BaseEngine): void {
  const { id } = engine.metadata;
  if (engines.has(id)) {
    throw new Error(`Engine "${id}" is already registered. Each engine id must be unique.`);
  }
  engines.set(id, engine);
}

export function listEngines(): BaseEngine[] {
  return Array.from(engines.values());
}

export function getEngine(id: EngineId): BaseEngine | undefined {
  return engines.get(id);
}

/** Test-only: registerEngine() rejects re-registering the same id, so tests
 * that construct engines fresh need a way to reset between runs. Not
 * intended for production use. */
export function clearRegistryForTests(): void {
  engines.clear();
}
