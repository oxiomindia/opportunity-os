import 'server-only';

import { cache } from 'react';
import type { Customer } from '../../types/customer';
import { requireSessionContext } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';
import { mockCustomers } from '../../data/mockCustomers';

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  billing_address: string | null;
  tax_identifier: string | null;
  created_at: string;
}

function toCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    billingAddress: row.billing_address ?? undefined,
    taxIdentifier: row.tax_identifier ?? undefined,
    createdAt: row.created_at,
  };
}

const customerSelect = 'id, name, email, phone, billing_address, tax_identifier, created_at';

export const listCustomers = cache(async (): Promise<Customer[]> => {
  const { organization, mode } = await requireSessionContext();
  if (mode === 'demo') return mockCustomers;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('customers').select(customerSelect)
    .eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(500);
  if (error) throw new Error(`Unable to load customers: ${error.code}`);
  return (data as unknown as CustomerRow[]).map(toCustomer);
});

export async function getCustomer(id: string): Promise<Customer | null> {
  const session = await requireSessionContext();
  if (session.mode === 'demo') return mockCustomers.find((customer) => customer.id === id) ?? null;
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) return null;
  const { organization } = session;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('customers').select(customerSelect)
    .eq('organization_id', organization.id).eq('id', id).maybeSingle();
  if (error) throw new Error(`Unable to load customer: ${error.code}`);
  return data ? toCustomer(data as unknown as CustomerRow) : null;
}
