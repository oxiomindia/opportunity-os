import { BaseEngine } from '../engine/base';
import type { EngineHealth, EngineMetadata, EngineStatus } from '../engine/types';
import { registerEngine } from '../engine/registry';
import { getAuthCapabilities } from '../supabase/config';

/**
 * ITC Recovery & Reconciliation as a platform engine. This wraps the
 * existing lib/itcRecovery/{repository,reconciliation,report,csv,pdf}
 * modules -- it does not change or duplicate any of their behavior, only
 * describes them for the Engine Registry.
 */
class ItcRecoveryEngine extends BaseEngine {
  readonly metadata: EngineMetadata = {
    id: 'itc-recovery',
    name: 'Input Tax Credit Recovery & Reconciliation',
    description: 'Reconciles purchase-side tax (vendor_invoices.tax_total) against filed GST return records by GSTIN and invoice number, with a configurable amount tolerance.',
    version: '1.0.0',
    dependencies: ['bills'],
    capabilities: ['reconciliation', 'csv-export', 'pdf-export'],
    inputs: ['vendor_invoices (tax_total > 0)', 'vendors', 'itc_return_records'],
    outputs: ['ItcReconciliationReport (dashboard, CSV, PDF)'],
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

export const itcRecoveryEngine = new ItcRecoveryEngine();
registerEngine(itcRecoveryEngine);
