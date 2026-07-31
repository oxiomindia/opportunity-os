import { BaseEngine } from '../engine/base';
import type { EngineHealth, EngineMetadata, EngineStatus } from '../engine/types';
import { registerEngine } from '../engine/registry';
import { eventBus } from '../events/bus';

/**
 * Growth Intelligence as a platform engine -- registers with the existing
 * Engine Registry and publishes engine.health-checked on the existing
 * Event Bus, the same pattern ItcRecoveryEngine/BillsEngine/
 * CommercialEngine use. Reuses the Engine Framework rather than inventing
 * a parallel one for this module.
 *
 * Unlike those three, this engine's state (opportunities, drafts,
 * published engagements, click/conversion tracking) is entirely
 * in-process -- it never queries Supabase, so getAuthCapabilities isn't a
 * real signal for it the way it is for the other three. Status/health are
 * unconditionally healthy: an honest reflection of "nothing external for
 * this engine to depend on," not a fabricated dependency check.
 */
class GrowthIntelligenceEngine extends BaseEngine {
  readonly metadata: EngineMetadata = {
    id: 'growth-intelligence',
    name: 'Growth Intelligence',
    description: 'Social listening, opportunity detection, and a human-review-first draft/approval workflow for Oxiom\'s marketing team.',
    version: '1.0.0',
    dependencies: [],
    capabilities: ['opportunity-detection', 'draft-assistance', 'duplicate-prevention', 'quality-scoring', 'click-tracking', 'conversion-tracking'],
    inputs: ['manually submitted discussion snippets (lib/growth/sources.ts)'],
    outputs: ['Opportunity, DraftReply, PublishedEngagement, ClickEvent, ConversionEvent records'],
    supportedEvents: ['engine.health-checked', 'growth.engagement-published'],
  };

  getStatus(): EngineStatus {
    return 'active';
  }

  async getHealth(): Promise<EngineHealth> {
    const health: EngineHealth = { status: 'healthy', checkedAt: new Date().toISOString() };
    await eventBus.publish({
      eventName: 'engine.health-checked',
      sourceEngine: this.metadata.id,
      payload: { status: this.getStatus(), health },
    });
    return health;
  }
}

export const growthIntelligenceEngine = new GrowthIntelligenceEngine();
registerEngine(growthIntelligenceEngine);
