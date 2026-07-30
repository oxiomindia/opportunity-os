'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionContext } from '../../../lib/auth/dal';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

/**
 * Manual entry of a single filed-return line. Bulk CSV import is a
 * separate action added alongside the Checkpoint 3 import UI, since it
 * needs a file to parse.
 */
export async function createItcReturnRecord(formData: FormData) {
  const vendorGstin = field(formData, 'vendorGstin');
  const vendorName = field(formData, 'vendorName');
  const returnInvoiceNumber = field(formData, 'returnInvoiceNumber');
  const invoiceDate = field(formData, 'invoiceDate') || null;
  const returnPeriod = field(formData, 'returnPeriod');
  const taxableValue = Number(field(formData, 'taxableValue') || '0');
  const taxAmount = Number(field(formData, 'taxAmount') || '0');
  const currency = field(formData, 'currency') || 'INR';

  if (!vendorGstin || !vendorName || !returnInvoiceNumber || !returnPeriod || !Number.isFinite(taxableValue) || !Number.isFinite(taxAmount)) {
    redirect('/itc-recovery/new?error=invalid');
  }

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect('/itc-recovery?error=demo-read-only');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('create_itc_return_record', {
    target_organization: session.organization.id,
    vendor_gstin_value: vendorGstin,
    vendor_name_value: vendorName,
    return_invoice_number_value: returnInvoiceNumber,
    invoice_date_value: invoiceDate,
    return_period_value: returnPeriod,
    taxable_value_amount: taxableValue,
    tax_amount_value: taxAmount,
    currency_value: currency,
  });
  if (error) redirect('/itc-recovery/new?error=mutation');
  revalidatePath('/itc-recovery');
  redirect('/itc-recovery');
}

export async function deleteItcReturnRecord(formData: FormData) {
  const recordId = field(formData, 'recordId');
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
  if (!uuidPattern.test(recordId)) redirect('/itc-recovery?error=invalid');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect('/itc-recovery?error=demo-read-only');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('delete_itc_return_record', { target_record: recordId });
  if (error) redirect('/itc-recovery?error=mutation');
  revalidatePath('/itc-recovery');
  redirect('/itc-recovery');
}
