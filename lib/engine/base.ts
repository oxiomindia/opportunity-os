import type {
  EngineConfiguration,
  EngineContext,
  EngineDiagnostics,
  EngineHealth,
  EngineMetadata,
  EngineMetrics,
  EngineResult,
  EngineStatus,
} from './types';

/**
 * BaseEngine -- the platform primitive every engine (Bills, ITC Recovery,
 * Commercial, and every future one) extends. See lib/engine/README.md for
 * the full contract and registration pattern.
 *
 * Lifecycle methods (initialize/start/stop/restart) default to no-ops here
 * deliberately: every engine registered on this platform today is stateless
 * request-scoped code running in a serverless function, not a long-running
 * process. A future engine that genuinely needs startup/shutdown work
 * (e.g. opening a persistent connection) overrides these; nothing about the
 * contract assumes it needs to.
 */
export abstract class BaseEngine {
  abstract readonly metadata: EngineMetadata;

  abstract getStatus(): EngineStatus;
  abstract getHealth(context?: EngineContext): Promise<EngineHealth> | EngineHealth;

  /** Engine-owned configuration. Empty by default -- no centralized
   * configuration store exists yet (see the platform architecture review's
   * Technical Debt section); override once an engine has real, non-secret
   * configuration worth surfacing read-only in the Engine Registry. */
  getConfiguration(): EngineConfiguration {
    return {};
  }

  /** Always valid by default. Override to reject configuration a real
   * engine actually depends on -- do not fabricate validation rules for
   * configuration that doesn't exist. */
  validateConfiguration(config: EngineConfiguration): EngineResult<true> {
    void config;
    return { ok: true, data: true };
  }

  /** Empty by default -- no metrics/observability infrastructure exists yet
   * (see the platform architecture review's Technical Debt section).
   * Override only with metrics an engine can compute honestly and cheaply;
   * do not fabricate numbers to make this look populated. */
  getMetrics(): EngineMetrics {
    return {};
  }

  discoverCapabilities(): string[] {
    return this.metadata.capabilities;
  }

  async getDiagnostics(context?: EngineContext): Promise<EngineDiagnostics> {
    return {
      health: await this.getHealth(context),
      configuration: this.getConfiguration(),
      metrics: this.getMetrics(),
    };
  }

  async initialize(context?: EngineContext): Promise<void> {
    void context;
  }

  async start(context?: EngineContext): Promise<void> {
    void context;
  }

  async stop(context?: EngineContext): Promise<void> {
    void context;
  }

  async restart(context?: EngineContext): Promise<void> {
    await this.stop(context);
    await this.start(context);
  }
}
