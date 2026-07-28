import 'server-only';

import { cache } from 'react';
import type { ProductService, ProductServiceCurrency } from '../../types/productService';
import { requireSessionContext } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';
import { mockProductsServices } from '../../data/mockProductsServices';

interface ProductServiceRow {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  unit_price: string | null;
  currency: string;
  active: boolean;
  created_at: string;
}

function toProductService(row: ProductServiceRow): ProductService {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    sku: row.sku ?? undefined,
    unitPrice: Number(row.unit_price ?? 0),
    currency: (['USD', 'EUR', 'INR'] as const).includes(row.currency as ProductServiceCurrency)
      ? (row.currency as ProductServiceCurrency)
      : 'USD',
    active: row.active,
    createdAt: row.created_at,
  };
}

const productServiceSelect = 'id, name, description, sku, unit_price, currency, active, created_at';

export const listProductsServices = cache(async (): Promise<ProductService[]> => {
  const { organization, mode } = await requireSessionContext();
  if (mode === 'demo') return mockProductsServices;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('products_services').select(productServiceSelect)
    .eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(500);
  if (error) throw new Error(`Unable to load products and services: ${error.code}`);
  return (data as unknown as ProductServiceRow[]).map(toProductService);
});

export async function getProductService(id: string): Promise<ProductService | null> {
  const session = await requireSessionContext();
  if (session.mode === 'demo') return mockProductsServices.find((item) => item.id === id) ?? null;
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) return null;
  const { organization } = session;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('products_services').select(productServiceSelect)
    .eq('organization_id', organization.id).eq('id', id).maybeSingle();
  if (error) throw new Error(`Unable to load product/service: ${error.code}`);
  return data ? toProductService(data as unknown as ProductServiceRow) : null;
}
