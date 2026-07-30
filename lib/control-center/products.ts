import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';
import { products as catalogProducts } from '../products/catalog';
import { getProductDisplayName } from '../products/types';

export interface ProductWithSettings {
  productId: string;
  slug: string;
  displayName: string;
  visible: boolean;
  statusOverride: string | null;
  badgeLabel: string | null;
}

export interface PricingHistoryRow {
  id: string;
  planName: string;
  region: string;
  monthlyPricePaise: number | null;
  annualPricePaise: number | null;
  currency: string;
  effectiveFrom: string;
}

/** Products module: platform_products joined with their Owner-set commercial_product_settings. */
export async function listProductsWithSettings(): Promise<ProductWithSettings[]> {
  const supabase = await createSupabaseServerClient();
  const { data: platformProducts, error } = await supabase.from('platform_products').select('id, slug').order('slug');
  if (error || !platformProducts) throw new Error('Unable to load platform products');
  const { data: settings } = await supabase.from('commercial_product_settings').select('*');
  const settingsByProductId = new Map((settings ?? []).map((row) => [row.product_id as string, row]));

  return platformProducts.map((product) => {
    const catalogEntry = catalogProducts.find((entry) => entry.id === product.slug);
    const settingsRow = settingsByProductId.get(product.id);
    return {
      productId: product.id,
      slug: product.slug,
      displayName: catalogEntry ? getProductDisplayName(catalogEntry) : product.slug,
      visible: settingsRow?.visible ?? true,
      statusOverride: settingsRow?.status_override ?? null,
      badgeLabel: settingsRow?.badge_label ?? null,
    };
  });
}

/** Pricing module: the full price history for one product, newest first. */
export async function listPricingHistory(productId: string): Promise<PricingHistoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('commercial_product_pricing')
    .select('id, plan_name, region, monthly_price_paise, annual_price_paise, currency, effective_from')
    .eq('product_id', productId)
    .order('effective_from', { ascending: false })
    .limit(10);
  if (error) throw new Error('Unable to load pricing history');
  return (data ?? []).map((row) => ({
    id: row.id,
    planName: row.plan_name,
    region: row.region,
    monthlyPricePaise: row.monthly_price_paise,
    annualPricePaise: row.annual_price_paise,
    currency: row.currency,
    effectiveFrom: row.effective_from,
  }));
}
