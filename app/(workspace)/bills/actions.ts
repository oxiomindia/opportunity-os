'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionContext } from '../../../lib/auth/dal';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { allowedInvoiceMimeTypes, matchesInvoiceSignature, maxInvoiceFileSize, sanitizeInvoiceFilename } from '../../../lib/uploads/validation';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
const approverRoles = ['owner', 'admin', 'reviewer'];

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function createBill(formData: FormData) {
  const vendorId = field(formData, 'vendorId');
  const vendorInvoiceNumber = field(formData, 'vendorInvoiceNumber');
  const invoiceDate = field(formData, 'invoiceDate');
  const dueDate = field(formData, 'dueDate');
  const currency = field(formData, 'currency') || 'USD';

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect('/bills?error=demo-read-only');
  if (!uuidPattern.test(vendorId) || !invoiceDate || !dueDate) redirect('/bills/new?error=invalid');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('create_vendor_invoice', {
    target_organization: session.organization.id,
    target_vendor: vendorId,
    invoice_number_value: vendorInvoiceNumber,
    invoice_date_value: invoiceDate,
    due_date_value: dueDate,
    invoice_currency: currency,
  });
  if (error || !data) redirect('/bills/new?error=mutation');
  redirect(`/bills/${data}`);
}

export async function addLineItem(formData: FormData) {
  const billId = field(formData, 'billId');
  const description = field(formData, 'description');
  const quantity = Number(field(formData, 'quantity'));
  const unitPrice = Number(field(formData, 'unitPrice'));
  const taxAmountField = field(formData, 'taxAmount');
  const taxAmount = taxAmountField ? Number(taxAmountField) : 0;

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/bills/${billId}?error=demo-read-only`);
  if (
    !uuidPattern.test(billId) || !description
    || !Number.isFinite(quantity) || quantity <= 0
    || !Number.isFinite(unitPrice) || unitPrice < 0
    || !Number.isFinite(taxAmount) || taxAmount < 0
  ) {
    redirect(`/bills/${billId}?error=invalid`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('add_vendor_invoice_line_item', {
    target_vendor_invoice: billId,
    line_description: description,
    line_quantity: quantity,
    line_unit_price: unitPrice,
    line_tax_amount: taxAmount,
  });
  if (error) redirect(`/bills/${billId}?error=mutation`);
  revalidatePath(`/bills/${billId}`);
  redirect(`/bills/${billId}?success=line-item-added`);
}

export async function submitForApproval(formData: FormData) {
  const billId = field(formData, 'id');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/bills/${billId}?error=demo-read-only`);
  if (!uuidPattern.test(billId)) redirect('/bills?error=invalid');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('submit_vendor_invoice_for_review', { target_vendor_invoice: billId, request_id: crypto.randomUUID() });
  if (error) redirect(`/bills/${billId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/bills'); revalidatePath(`/bills/${billId}`);
  redirect(`/bills/${billId}?success=submitted`);
}

export async function approveBill(formData: FormData) {
  const billId = field(formData, 'id');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/bills/${billId}?error=demo-read-only`);
  if (!approverRoles.includes(session.role)) redirect(`/bills/${billId}?error=forbidden`);
  if (!uuidPattern.test(billId)) redirect('/bills?error=invalid');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('approve_vendor_invoice', { target_vendor_invoice: billId, request_id: crypto.randomUUID() });
  if (error) redirect(`/bills/${billId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/bills'); revalidatePath(`/bills/${billId}`);
  redirect(`/bills/${billId}?success=approved`);
}

export async function rejectBill(formData: FormData) {
  const billId = field(formData, 'id');
  const reason = field(formData, 'reason');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/bills/${billId}?error=demo-read-only`);
  if (!approverRoles.includes(session.role)) redirect(`/bills/${billId}?error=forbidden`);
  if (!uuidPattern.test(billId) || reason.trim().length < 1) redirect(`/bills/${billId}?error=invalid`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('reject_vendor_invoice', { target_vendor_invoice: billId, rejection_reason: reason, request_id: crypto.randomUUID() });
  if (error) redirect(`/bills/${billId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/bills'); revalidatePath(`/bills/${billId}`);
  redirect(`/bills/${billId}?success=rejected`);
}

export async function schedulePayment(formData: FormData) {
  const billId = field(formData, 'id');
  const scheduledDate = field(formData, 'scheduledDate');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/bills/${billId}?error=demo-read-only`);
  if (!uuidPattern.test(billId) || !scheduledDate) redirect(`/bills/${billId}?error=invalid`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('schedule_vendor_invoice_payment', { target_vendor_invoice: billId, scheduled_date: scheduledDate, request_id: crypto.randomUUID() });
  if (error) redirect(`/bills/${billId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/bills'); revalidatePath(`/bills/${billId}`);
  redirect(`/bills/${billId}?success=scheduled`);
}

export async function recordPayment(formData: FormData) {
  const billId = field(formData, 'id');
  const amount = Number(field(formData, 'amount'));
  const reference = field(formData, 'reference');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/bills/${billId}?error=demo-read-only`);
  if (!uuidPattern.test(billId) || !Number.isFinite(amount) || amount <= 0) redirect(`/bills/${billId}?error=invalid`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('record_vendor_invoice_payment', {
    target_vendor_invoice: billId, payment_amount: amount, payment_reference_value: reference, request_id: crypto.randomUUID(),
  });
  if (error) redirect(`/bills/${billId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/bills'); revalidatePath(`/bills/${billId}`);
  redirect(`/bills/${billId}?success=paid`);
}

export async function voidBill(formData: FormData) {
  const billId = field(formData, 'id');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/bills/${billId}?error=demo-read-only`);
  if (!uuidPattern.test(billId)) redirect('/bills?error=invalid');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('void_vendor_invoice', { target_vendor_invoice: billId, request_id: crypto.randomUUID() });
  if (error) redirect(`/bills/${billId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/bills'); revalidatePath(`/bills/${billId}`);
  redirect(`/bills/${billId}?success=voided`);
}

export async function deleteDraftBill(formData: FormData) {
  const billId = field(formData, 'id');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/bills/${billId}?error=demo-read-only`);
  if (!['owner', 'admin'].includes(session.role)) redirect(`/bills/${billId}?error=forbidden`);
  if (!uuidPattern.test(billId)) redirect('/bills?error=invalid');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('delete_draft_vendor_invoice', { target_vendor_invoice: billId, request_id: crypto.randomUUID() });
  if (error) redirect(`/bills/${billId}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/bills');
  redirect('/bills?success=deleted');
}

export async function uploadAttachment(formData: FormData) {
  const billId = field(formData, 'billId');

  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (session.mode === 'demo') redirect(`/bills/${billId}?error=demo-read-only`);
  if (!uuidPattern.test(billId)) redirect('/bills?error=invalid');

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) redirect(`/bills/${billId}?error=invalid`);
  if (file.size > maxInvoiceFileSize) redirect(`/bills/${billId}?error=file-too-large`);
  if (!allowedInvoiceMimeTypes.has(file.type)) redirect(`/bills/${billId}?error=file-type`);

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (!matchesInvoiceSignature(buffer, file.type)) redirect(`/bills/${billId}?error=file-type`);
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const safeName = sanitizeInvoiceFilename(file.name);
  const attachmentId = crypto.randomUUID();
  const storageKey = `${session.organization.id}/${billId}/${attachmentId}-${safeName}`;

  const supabase = await createSupabaseServerClient();
  const { error: storageError } = await supabase.storage.from('invoice-attachments').upload(storageKey, buffer, { contentType: file.type, upsert: false });
  if (storageError) redirect(`/bills/${billId}?error=mutation`);

  const { error: rpcError } = await supabase.rpc('attach_vendor_invoice_file', {
    target_vendor_invoice: billId, attachment_id: attachmentId, storage_key: storageKey,
    original_name: file.name, mime_type: file.type, size_bytes: file.size, file_sha256: sha256, request_id: crypto.randomUUID(),
  });
  if (rpcError) {
    await supabase.storage.from('invoice-attachments').remove([storageKey]);
    redirect(`/bills/${billId}?error=mutation`);
  }
  revalidatePath(`/bills/${billId}`);
  redirect(`/bills/${billId}?success=uploaded`);
}
