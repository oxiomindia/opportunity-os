import 'server-only';

import { cache } from 'react';
import type { Invoice } from '../../types/invoice';
import { requireSessionContext } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';
import { mockInvoices } from '../../data/mockInvoices';

interface InvoiceRow {
  id: string; invoice_number: string | null; invoice_date: string | null; due_date: string | null;
  currency: string; subtotal: string | null; tax_total: string | null; total: string | null; status: Invoice['status'];
  extraction_confidence: string | null; source: Invoice['source']; created_at: string;
  vendors: { name: string; email: string | null } | { name: string; email: string | null }[] | null;
  attachments: { original_name: string; mime_type: string }[] | null;
}

function toInvoice(row: InvoiceRow): Invoice {
  const vendor = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors;
  const attachment = row.attachments?.[0];
  const mime = attachment?.mime_type;
  return {
    id: row.id,
    invoiceNumber: row.invoice_number ?? `INTAKE-${row.id.slice(0, 8).toUpperCase()}`,
    vendorName: vendor?.name ?? 'Pending vendor review',
    vendorEmail: vendor?.email ?? undefined,
    invoiceDate: row.invoice_date ?? row.created_at.slice(0, 10),
    dueDate: row.due_date ?? row.invoice_date ?? row.created_at.slice(0, 10),
    currency: ['INR', 'EUR'].includes(row.currency) ? row.currency as Invoice['currency'] : 'USD',
    subtotal: Number(row.subtotal ?? 0), tax: Number(row.tax_total ?? 0), total: Number(row.total ?? 0),
    status: row.status, confidence: Number(row.extraction_confidence ?? 0), source: row.source,
    receivedAt: row.created_at, exceptionCount: row.status === 'needs-review' ? 1 : 0,
    fileName: attachment?.original_name ?? 'No attachment',
    fileType: mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : 'jpg',
  };
}

const invoiceSelect = 'id, invoice_number, invoice_date, due_date, currency, subtotal, tax_total, total, status, extraction_confidence, source, created_at, vendors(name, email), attachments(original_name, mime_type)';

export const listInvoices = cache(async (): Promise<Invoice[]> => {
  const { organization, mode } = await requireSessionContext();
  if (mode === 'demo') return mockInvoices;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('invoices').select(invoiceSelect)
    .eq('organization_id', organization.id).is('deleted_at', null).is('archived_at', null)
    .order('created_at', { ascending: false }).limit(500);
  if (error) throw new Error(`Unable to load invoices: ${error.code}`);
  return (data as unknown as InvoiceRow[]).map(toInvoice);
});

export async function getInvoice(id: string): Promise<Invoice | null> {
  const session = await requireSessionContext();
  if (session.mode === 'demo') return mockInvoices.find((invoice) => invoice.id === id) ?? null;
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) return null;
  const { organization } = session;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('invoices').select(invoiceSelect)
    .eq('organization_id', organization.id).eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw new Error(`Unable to load invoice: ${error.code}`);
  return data ? toInvoice(data as unknown as InvoiceRow) : null;
}

export async function getInvoiceDocument(id: string) {
  const session = await requireSessionContext();
  if (session.mode === 'demo') return null;
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) return null;
  const { organization } = session;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('attachments').select('storage_key, original_name, mime_type')
    .eq('organization_id', organization.id).eq('invoice_id', id).eq('status', 'stored').limit(1).maybeSingle();
  if (error || !data) return null;
  const { data: signed, error: signedError } = await supabase.storage.from('invoice-attachments').createSignedUrl(data.storage_key, 300);
  if (signedError) return null;
  return { url: signed.signedUrl, name: data.original_name, mimeType: data.mime_type };
}
