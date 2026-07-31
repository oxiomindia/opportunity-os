import 'server-only';

import { cache } from 'react';
import type { Invoice, InvoiceLineItem } from '../../types/invoice';
import { requireSessionContext } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';
import { mockInvoices } from '../../data/mockInvoices';
import { mockInvoiceLineItems } from '../../data/mockInvoiceLineItems';

interface InvoiceRow {
  id: string; invoice_number: string | null; invoice_date: string | null; due_date: string | null;
  currency: string; subtotal: string | null; tax_total: string | null; total: string | null; status: Invoice['status'];
  created_at: string;
  customers: { name: string; email: string | null } | { name: string; email: string | null }[] | null;
}

function toInvoice(row: InvoiceRow): Invoice {
  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
  return {
    id: row.id,
    invoiceNumber: row.invoice_number ?? `DRAFT-${row.id.slice(0, 8).toUpperCase()}`,
    customerName: customer?.name ?? 'No customer selected',
    customerEmail: customer?.email ?? undefined,
    invoiceDate: row.invoice_date ?? row.created_at.slice(0, 10),
    dueDate: row.due_date ?? row.invoice_date ?? row.created_at.slice(0, 10),
    currency: ['INR', 'EUR'].includes(row.currency) ? row.currency as Invoice['currency'] : 'USD',
    subtotal: Number(row.subtotal ?? 0), tax: Number(row.tax_total ?? 0), total: Number(row.total ?? 0),
    status: row.status,
    createdAt: row.created_at,
  };
}

const invoiceSelect = 'id, invoice_number, invoice_date, due_date, currency, subtotal, tax_total, total, status, created_at, customers(name, email)';

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

interface InvoiceLineItemRow {
  id: string; description: string; quantity: string | null; unit_price: string | null; line_total: string;
}

export async function getInvoiceLineItems(id: string): Promise<InvoiceLineItem[]> {
  const session = await requireSessionContext();
  if (session.mode === 'demo') return mockInvoiceLineItems[id] ?? [];
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) return [];
  const { organization } = session;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('invoice_items').select('id, description, quantity, unit_price, line_total')
    .eq('organization_id', organization.id).eq('invoice_id', id).order('position', { ascending: true });
  if (error) throw new Error(`Unable to load invoice line items: ${error.code}`);
  return (data as unknown as InvoiceLineItemRow[]).map((row) => ({
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity ?? 0),
    unitPrice: Number(row.unit_price ?? 0),
    lineTotal: Number(row.line_total),
  }));
}
