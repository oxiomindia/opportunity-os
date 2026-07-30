import 'server-only';

import { cache } from 'react';
import type { ItcReturnRecord } from '../../types/itcRecovery';
import { requireSessionContext } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';
import { mockItcReturnRecords } from '../../data/mockItcReturnRecords';

interface ItcReturnRecordRow {
  id: string; vendor_id: string | null; vendor_name: string; vendor_gstin: string;
  return_invoice_number: string; invoice_date: string | null; return_period: string;
  taxable_value: string; tax_amount: string; currency: string; source: 'manual' | 'import';
  created_at: string;
}

function toItcReturnRecord(row: ItcReturnRecordRow): ItcReturnRecord {
  return {
    id: row.id,
    vendorId: row.vendor_id ?? undefined,
    vendorName: row.vendor_name,
    vendorGstin: row.vendor_gstin,
    returnInvoiceNumber: row.return_invoice_number,
    invoiceDate: row.invoice_date ?? undefined,
    returnPeriod: row.return_period,
    taxableValue: Number(row.taxable_value),
    taxAmount: Number(row.tax_amount),
    currency: row.currency,
    source: row.source,
    createdAt: row.created_at,
  };
}

const itcReturnRecordSelect = 'id, vendor_id, vendor_name, vendor_gstin, return_invoice_number, invoice_date, return_period, taxable_value, tax_amount, currency, source, created_at';

/** ITC return records for the current organization: the filed-return side of a reconciliation. */
export const listItcReturnRecords = cache(async (): Promise<ItcReturnRecord[]> => {
  const { organization, mode } = await requireSessionContext();
  if (mode === 'demo') return mockItcReturnRecords;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('itc_return_records').select(itcReturnRecordSelect)
    .eq('organization_id', organization.id).is('deleted_at', null)
    .order('created_at', { ascending: false }).limit(1000);
  if (error) throw new Error(`Unable to load ITC return records: ${error.code}`);
  return (data as unknown as ItcReturnRecordRow[]).map(toItcReturnRecord);
});
