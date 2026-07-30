import { BaseEngine } from '../engine/base';
import type { EngineHealth, EngineMetadata, EngineStatus } from '../engine/types';
import { registerEngine } from '../engine/registry';
import { eventBus } from '../events/bus';
import { getAuthCapabilities } from '../supabase/config';

/**
 * Bills (Accounts Payable) as a platform engine. Wraps the existing
 * lib/vendorInvoices/repository.ts and the vendor_invoice_* RPCs -- no
 * behavior change, only a description for the Engine Registry.
 */
class BillsEngine extends BaseEngine {
  readonly metadata: EngineMetadata = {
    id: 'bills',
    name: 'Bills (Accounts Payable)',
    description: 'Vendor invoice lifecycle: draft, submit for review, approve/reject, schedule/record payment, void -- with per-line tax capture feeding ITC Recovery.',
    version: '1.0.0',
    dependencies: ['vendors'],
    capabilities: ['lifecycle-management', 'line-item-tax-capture', 'attachment-storage'],
    inputs: ['vendors', 'vendor_invoice_items'],
    outputs: ['vendor_invoices', 'vendor_invoice_status_history', 'audit_logs'],
    supportedEvents: ['engine.health-checked'],
  };

  getStatus(): EngineStatus {
    return getAuthCapabilities(process.env).supabase ? 'active' : 'error';
  }

  async getHealth(): Promise<EngineHealth> {
    const configured = getAuthCapabilities(process.env).supabase;
    const health: EngineHealth = {
      status: configured ? 'healthy' : 'unhealthy',
      message: configured ? undefined : 'Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY missing).',
      checkedAt: new Date().toISOString(),
    };
    await eventBus.publish({
      eventName: 'engine.health-checked',
      sourceEngine: this.metadata.id,
      payload: { status: this.getStatus(), health },
    });
    return health;
  }
}

export const billsEngine = new BillsEngine();
registerEngine(billsEngine);
