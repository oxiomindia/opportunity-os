'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionContext } from '../../../lib/auth/dal';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function createInvoice(formData: FormData) {
  const customerId = field(formData, 'customerId');
  const invoiceDate = field(formData, 'invoiceDate');
  const dueDate = field(formData, 'dueDate');
  const currency = field(formData, 'currency') || 'USD';

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect('/invoices?error=demo-read-only');
  if (!uuidPattern.test(customerId) || !invoiceDate || !dueDate) redirect('/invoices/new?error=invalid');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('create_invoice', {
    target_organization: session.organization.id,
    target_customer: customerId,
    invoice_date_value: invoiceDate,
    due_date_value: dueDate,
    invoice_currency: currency,
  });
  if (error || !data) redirect('/invoices/new?error=mutation');
  redirect(`/invoices/${data}`);
}

export async function addLineItem(formData: FormData) {
  const invoiceId = field(formData, 'invoiceId');
  const description = field(formData, 'description');
  const quantity = Number(field(formData, 'quantity'));
  const unitPrice = Number(field(formData, 'unitPrice'));
  const productId = field(formData, 'productId');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/invoices/${invoiceId}?error=demo-read-only`);
  if (!uuidPattern.test(invoiceId) || !description || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
    redirect(`/invoices/${invoiceId}?error=invalid`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('add_invoice_line_item', {
    target_invoice: invoiceId,
    line_product: productId && uuidPattern.test(productId) ? productId : null,
    line_description: description,
    line_quantity: quantity,
    line_unit_price: unitPrice,
  });
  if (error) redirect(`/invoices/${invoiceId}?error=mutation`);
  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}?success=line-item-added`);
}

export async function sendInvoice(formData: FormData) {
  const invoiceId = field(formData, 'id');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/invoices/${invoiceId}?error=demo-read-only`);
  if (!uuidPattern.test(invoiceId)) redirect('/invoices?error=invalid');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('send_invoice', { target_invoice: invoiceId, request_id: crypto.randomUUID() });
  if (error) redirect(`/invoices/${invoiceId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/invoices'); revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}?success=sent`);
}

export async function recordPayment(formData: FormData) {
  const invoiceId = field(formData, 'id');
  const amount = Number(field(formData, 'amount'));

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/invoices/${invoiceId}?error=demo-read-only`);
  if (!uuidPattern.test(invoiceId) || !Number.isFinite(amount) || amount <= 0) redirect(`/invoices/${invoiceId}?error=invalid`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('record_invoice_payment', { target_invoice: invoiceId, payment_amount: amount, request_id: crypto.randomUUID() });
  if (error) redirect(`/invoices/${invoiceId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/invoices'); revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}?success=paid`);
}

export async function voidInvoice(formData: FormData) {
  const invoiceId = field(formData, 'id');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/invoices/${invoiceId}?error=demo-read-only`);
  if (!uuidPattern.test(invoiceId)) redirect('/invoices?error=invalid');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('void_invoice', { target_invoice: invoiceId, request_id: crypto.randomUUID() });
  if (error) redirect(`/invoices/${invoiceId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/invoices'); revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}?success=voided`);
}

export async function deleteDraftInvoice(formData: FormData) {
  const invoiceId = field(formData, 'id');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/invoices/${invoiceId}?error=demo-read-only`);
  if (!['owner', 'admin'].includes(session.role)) redirect(`/invoices/${invoiceId}?error=forbidden`);
  if (!uuidPattern.test(invoiceId)) redirect('/invoices?error=invalid');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('delete_draft_invoice', { target_invoice: invoiceId, request_id: crypto.randomUUID() });
  if (error) redirect(`/invoices/${invoiceId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/invoices');
  redirect('/invoices?success=deleted');
}
