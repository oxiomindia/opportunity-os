'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSessionContext } from '../../../lib/auth/dal';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function createCustomer(formData: FormData) {
  const { organization, mode } = await requireSessionContext();
  const name = field(formData, 'name');
  if (name.trim().length < 1) redirect('/customers?error=invalid');
  if (mode === 'demo') redirect('/customers?error=demo-read-only');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('create_customer', {
    target_organization: organization.id,
    customer_name: name,
    customer_email: field(formData, 'email'),
    customer_phone: field(formData, 'phone'),
    customer_billing_address: field(formData, 'billingAddress'),
    customer_tax_identifier: field(formData, 'taxIdentifier'),
  });
  if (error) redirect('/customers?error=mutation');
  revalidatePath('/customers');
  redirect('/customers');
}

export async function updateCustomer(formData: FormData) {
  const { mode } = await requireSessionContext();
  const id = field(formData, 'id');
  const name = field(formData, 'name');
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) redirect('/customers?error=invalid');
  if (name.trim().length < 1) redirect('/customers?error=invalid');
  if (mode === 'demo') redirect('/customers?error=demo-read-only');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('update_customer', {
    target_customer: id,
    customer_name: name,
    customer_email: field(formData, 'email'),
    customer_phone: field(formData, 'phone'),
    customer_billing_address: field(formData, 'billingAddress'),
    customer_tax_identifier: field(formData, 'taxIdentifier'),
  });
  if (error) redirect('/customers?error=mutation');
  revalidatePath('/customers');
  redirect('/customers');
}
