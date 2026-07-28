'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSessionContext } from '../../../lib/auth/dal';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

function parsePrice(raw: string) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : NaN;
}

export async function createProductService(formData: FormData) {
  const { organization, mode } = await requireSessionContext();
  const name = field(formData, 'name');
  const unitPrice = parsePrice(field(formData, 'unitPrice'));
  if (name.trim().length < 1 || Number.isNaN(unitPrice) || unitPrice < 0) redirect('/products?error=invalid');
  if (mode === 'demo') redirect('/products?error=demo-read-only');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('create_product_service', {
    target_organization: organization.id,
    item_name: name,
    item_description: field(formData, 'description'),
    item_sku: field(formData, 'sku'),
    item_unit_price: unitPrice,
    item_currency: field(formData, 'currency') || 'USD',
  });
  if (error) redirect('/products?error=mutation');
  revalidatePath('/products');
  redirect('/products');
}

export async function updateProductService(formData: FormData) {
  const { mode } = await requireSessionContext();
  const id = field(formData, 'id');
  const name = field(formData, 'name');
  const unitPrice = parsePrice(field(formData, 'unitPrice'));
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) redirect('/products?error=invalid');
  if (name.trim().length < 1 || Number.isNaN(unitPrice) || unitPrice < 0) redirect('/products?error=invalid');
  if (mode === 'demo') redirect('/products?error=demo-read-only');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('update_product_service', {
    target_item: id,
    item_name: name,
    item_description: field(formData, 'description'),
    item_sku: field(formData, 'sku'),
    item_unit_price: unitPrice,
    item_currency: field(formData, 'currency') || 'USD',
    item_active: formData.get('active') === 'on',
  });
  if (error) redirect('/products?error=mutation');
  revalidatePath('/products');
  redirect('/products');
}
