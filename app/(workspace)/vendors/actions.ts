'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSessionContext } from '../../../lib/auth/dal';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function createVendor(formData: FormData) {
  const { organization, mode } = await requireSessionContext();
  const name = field(formData, 'name');
  if (name.trim().length < 1) redirect('/vendors?error=invalid');
  if (mode === 'demo') redirect('/vendors?error=demo-read-only');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('create_vendor', {
    target_organization: organization.id,
    vendor_name: name,
    vendor_email: field(formData, 'email'),
    vendor_phone: field(formData, 'phone'),
    vendor_address: field(formData, 'address'),
    vendor_tax_identifier: field(formData, 'taxIdentifier'),
  });
  if (error) redirect('/vendors?error=mutation');
  revalidatePath('/vendors');
  redirect('/vendors?success=created');
}

export async function updateVendor(formData: FormData) {
  const { mode } = await requireSessionContext();
  const id = field(formData, 'id');
  const name = field(formData, 'name');
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) redirect('/vendors?error=invalid');
  if (name.trim().length < 1) redirect('/vendors?error=invalid');
  if (mode === 'demo') redirect('/vendors?error=demo-read-only');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('update_vendor', {
    target_vendor: id,
    vendor_name: name,
    vendor_email: field(formData, 'email'),
    vendor_phone: field(formData, 'phone'),
    vendor_address: field(formData, 'address'),
    vendor_tax_identifier: field(formData, 'taxIdentifier'),
  });
  if (error) redirect('/vendors?error=mutation');
  revalidatePath('/vendors');
  redirect('/vendors?success=updated');
}
