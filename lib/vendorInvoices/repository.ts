import 'server-only';

import { cache } from 'react';
import type { VendorInvoice, VendorInvoiceAttachment, VendorInvoiceLineItem } from '../../types/vendorInvoice';
import { requireSessionContext } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';
import { mockVendorInvoices } from '../../data/mockVendorInvoices';

interface VendorInvoiceRow {
  id: string; vendor_invoice_number: string | null; invoice_date: string | null; due_date: string | null;
  currency: string; subtotal: string | null; tax_total: string | null; total: string | null; status: VendorInvoice['status'];
  payment_scheduled_date: string | null; payment_reference: string | null;
  created_at: string;
  vendors: { name: string; email: string | null } | { name: string; email: string | null }[] | null;
}

function toVendorInvoice(row: VendorInvoiceRow): VendorInvoice {
  const vendor = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors;
  return {
    id: row.id,
    vendorInvoiceNumber: row.vendor_invoice_number ?? undefined,
    vendorName: vendor?.name ?? 'No vendor selected',
    vendorEmail: vendor?.email ?? undefined,
    invoiceDate: row.invoice_date ?? row.created_at.slice(0, 10),
    dueDate: row.due_date ?? row.invoice_date ?? row.created_at.slice(0, 10),
    currency: ['INR', 'EUR'].includes(row.currency) ? row.currency as VendorInvoice['currency'] : 'USD',
    subtotal: Number(row.subtotal ?? 0), tax: Number(row.tax_total ?? 0), total: Number(row.total ?? 0),
    status: row.status,
    paymentScheduledDate: row.payment_scheduled_date ?? undefined,
    paymentReference: row.payment_reference ?? undefined,
    createdAt: row.created_at,
  };
}

const vendorInvoiceSelect = 'id, vendor_invoice_number, invoice_date, due_date, currency, subtotal, tax_total, total, status, payment_scheduled_date, payment_reference, created_at, vendors(name, email)';

export const listVendorInvoices = cache(async (): Promise<VendorInvoice[]> => {
  const { organization, mode } = await requireSessionContext();
  if (mode === 'demo') return mockVendorInvoices;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('vendor_invoices').select(vendorInvoiceSelect)
    .eq('organization_id', organization.id).is('deleted_at', null).is('archived_at', null)
    .order('created_at', { ascending: false }).limit(500);
  if (error) throw new Error(`Unable to load bills: ${error.code}`);
  return (data as unknown as VendorInvoiceRow[]).map(toVendorInvoice);
});

export async function getVendorInvoice(id: string): Promise<VendorInvoice | null> {
  const session = await requireSessionContext();
  if (session.mode === 'demo') return mockVendorInvoices.find((invoice) => invoice.id === id) ?? null;
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) return null;
  const { organization } = session;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('vendor_invoices').select(vendorInvoiceSelect)
    .eq('organization_id', organization.id).eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw new Error(`Unable to load bill: ${error.code}`);
  return data ? toVendorInvoice(data as unknown as VendorInvoiceRow) : null;
}

interface VendorInvoiceLineItemRow {
  id: string; description: string; quantity: string | null; unit_price: string | null; line_total: string;
}

export async function getVendorInvoiceLineItems(id: string): Promise<VendorInvoiceLineItem[]> {
  const session = await requireSessionContext();
  if (session.mode === 'demo') return [];
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) return [];
  const { organization } = session;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('vendor_invoice_items').select('id, description, quantity, unit_price, line_total')
    .eq('organization_id', organization.id).eq('vendor_invoice_id', id).order('position', { ascending: true });
  if (error) throw new Error(`Unable to load bill line items: ${error.code}`);
  return (data as unknown as VendorInvoiceLineItemRow[]).map((row) => ({
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity ?? 0),
    unitPrice: Number(row.unit_price ?? 0),
    lineTotal: Number(row.line_total),
  }));
}

interface VendorInvoiceAttachmentRow {
  id: string; original_name: string; mime_type: string; size_bytes: number; created_at: string;
}

export async function getVendorInvoiceAttachments(id: string): Promise<VendorInvoiceAttachment[]> {
  const session = await requireSessionContext();
  if (session.mode === 'demo') return [];
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) return [];
  const { organization } = session;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('vendor_invoice_attachments').select('id, original_name, mime_type, size_bytes, created_at')
    .eq('organization_id', organization.id).eq('vendor_invoice_id', id).order('created_at', { ascending: false });
  if (error) throw new Error(`Unable to load bill attachments: ${error.code}`);
  return (data as unknown as VendorInvoiceAttachmentRow[]).map((row) => ({
    id: row.id,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
  }));
}
