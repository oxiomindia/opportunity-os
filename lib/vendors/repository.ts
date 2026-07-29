import 'server-only';

import { cache } from 'react';
import type { Vendor } from '../../types/vendor';
import { requireSessionContext } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';
import { mockVendors } from '../../data/mockVendors';

interface VendorRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_identifier: string | null;
  created_at: string;
}

function toVendor(row: VendorRow): Vendor {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    taxIdentifier: row.tax_identifier ?? undefined,
    createdAt: row.created_at,
  };
}

const vendorSelect = 'id, name, email, phone, address, tax_identifier, created_at';

export const listVendors = cache(async (): Promise<Vendor[]> => {
  const { organization, mode } = await requireSessionContext();
  if (mode === 'demo') return mockVendors;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('vendors').select(vendorSelect)
    .eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(500);
  if (error) throw new Error(`Unable to load vendors: ${error.code}`);
  return (data as unknown as VendorRow[]).map(toVendor);
});

export async function getVendor(id: string): Promise<Vendor | null> {
  const session = await requireSessionContext();
  if (session.mode === 'demo') return mockVendors.find((vendor) => vendor.id === id) ?? null;
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) return null;
  const { organization } = session;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('vendors').select(vendorSelect)
    .eq('organization_id', organization.id).eq('id', id).maybeSingle();
  if (error) throw new Error(`Unable to load vendor: ${error.code}`);
  return data ? toVendor(data as unknown as VendorRow) : null;
}
