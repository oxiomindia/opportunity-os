import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getSessionContext } from '../../../../lib/auth/dal';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { allowedInvoiceMimeTypes, matchesInvoiceSignature, maxInvoiceFileSize, sanitizeInvoiceFilename } from '../../../../lib/uploads/validation';

export const runtime = 'nodejs';

function error(message: string, status: number, requestId: string) {
  return NextResponse.json({ ok: false, error: { message, requestId } }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const user = await getAuthenticatedUser();
  if (!user) return error('Authentication is required.', 401, requestId);
  const session = await getSessionContext();
  if (!session) return error('An active organization membership is required.', 403, requestId);
  if (!['owner', 'admin', 'reviewer', 'member'].includes(session.role)) return error('Your role cannot upload invoices.', 403, requestId);

  let formData: FormData;
  try { formData = await request.formData(); } catch { return error('The upload request is malformed.', 400, requestId); }
  const file = formData.get('file');
  if (!(file instanceof File)) return error('Select an invoice file to upload.', 400, requestId);
  if (file.size === 0 || file.size > maxInvoiceFileSize) return error('Invoice files must be between 1 byte and 25 MB.', 413, requestId);
  if (!allowedInvoiceMimeTypes.has(file.type)) return error('Only PDF, PNG, and JPEG invoices are supported.', 415, requestId);

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (!matchesInvoiceSignature(buffer, file.type)) return error('The file content does not match its declared type.', 415, requestId);
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const safeName = sanitizeInvoiceFilename(file.name);
  const invoiceId = crypto.randomUUID();
  const attachmentId = crypto.randomUUID();
  const storageKey = `${session.organization.id}/${invoiceId}/${attachmentId}-${safeName}`;
  const supabase = await createSupabaseServerClient();

  const { error: storageError } = await supabase.storage.from('invoice-attachments').upload(storageKey, buffer, { contentType: file.type, upsert: false });
  if (storageError) {
    console.error('Invoice storage failed', { requestId, organizationId: session.organization.id, code: storageError.message });
    return error('The document could not be stored. Please retry.', 503, requestId);
  }
  const { error: invoiceError } = await supabase.rpc('create_uploaded_invoice', {
    target_organization: session.organization.id, invoice_id: invoiceId, attachment_id: attachmentId,
    storage_key: storageKey, original_name: file.name, mime_type: file.type, size_bytes: file.size,
    file_sha256: sha256, request_id: requestId,
  });
  if (invoiceError) {
    await supabase.storage.from('invoice-attachments').remove([storageKey]);
    console.error('Invoice creation failed', { requestId, organizationId: session.organization.id, code: invoiceError.code });
    return error('The invoice record could not be created. Please retry.', 503, requestId);
  }

  return NextResponse.json({ ok: true, data: { id: invoiceId, filename: file.name, size: file.size, mimeType: file.type, uploadedAt: new Date().toISOString(), status: 'received', source: 'manual-upload' } }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
