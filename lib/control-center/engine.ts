import { BaseEngine } from '../engine/base';
import type { EngineHealth, EngineMetadata, EngineStatus } from '../engine/types';
import { registerEngine } from '../engine/registry';
import { getAuthCapabilities } from '../supabase/config';

/**
 * Commercial Administration as a platform engine -- the cluster the
 * platform architecture review identified as "structurally the most
 * engine-shaped" module already: Subscriptions, Trials, Revenue,
 * Promotions, and Coupons, all namespaced under lib/control-center/* with
 * their own audit log (commercial_audit_logs). Wraps existing behavior;
 * changes none of it.
 */
class CommercialEngine extends BaseEngine {
  readonly metadata: EngineMetadata = {
    id: 'commercial',
    name: 'Commercial Administration',
    description: 'Subscriptions, trials, revenue reporting, promotions, and coupons for the Oxiom platform itself -- customer-facing commercial lifecycle, not tenant AP/AR data.',
    version: '1.0.0',
    dependencies: [],
    capabilities: ['subscription-lifecycle', 'trial-lifecycle', 'revenue-aggregation', 'promotions', 'coupons'],
    inputs: ['organization_commercial_profile', 'commercial_plans', 'commercial_product_pricing'],
    outputs: ['subscriptions', 'trials', 'commercial_audit_logs'],
    supportedEvents: [],
  };

  getStatus(): EngineStatus {
    return getAuthCapabilities(process.env).supabase ? 'active' : 'error';
  }

  getHealth(): EngineHealth {
    const configured = getAuthCapabilities(process.env).supabase;
    return {
      status: configured ? 'healthy' : 'unhealthy',
      message: configured ? undefined : 'Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY missing).',
      checkedAt: new Date().toISOString(),
    };
  }
}

export const commercialEngine = new CommercialEngine();
registerEngine(commercialEngine);
