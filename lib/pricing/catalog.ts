import 'server-only';

import { getAuthCapabilities } from '../supabase/config';
import { createSupabaseServerClient } from '../supabase/server';

export interface ProductPricing {
  productId: string;
  monthlyPriceInr: number;
  annualPriceInr: number;
  /** e.g. "Early Access Add-on" for a product still in early access. */
  addOnLabel?: string;
  visible: boolean;
}

export interface PromoBanner {
  headline: string;
  description: string;
}

interface PublicPricingRow {
  slug: string;
  badge_label: string | null;
  status_override: string | null;
  monthly_price_paise: number | null;
  annual_price_paise: number | null;
  currency: string;
  effective_from: string;
}

interface ActivePromotionRow {
  headline: string;
  description: string | null;
  discount_percent: number | null;
}

/**
 * Reads from get_public_pricing() — a SECURITY DEFINER function that is the
 * only path the website has into commercial data, returning just the
 * current effective price for visible products. No admin-only field
 * (updated_by, pricing history, hidden products) can leak through it.
 */
export async function getVisiblePricing(): Promise<ProductPricing[]> {
  if (!getAuthCapabilities(process.env).supabase) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_public_pricing');
  if (error || !data) return [];
  return (data as PublicPricingRow[])
    .filter((row) => row.monthly_price_paise != null && row.annual_price_paise != null)
    .map((row) => ({
      productId: row.slug,
      monthlyPriceInr: row.monthly_price_paise! / 100,
      annualPriceInr: row.annual_price_paise! / 100,
      addOnLabel: row.badge_label ?? undefined,
      visible: true,
    }));
}

export async function getPromoBanner(): Promise<PromoBanner | undefined> {
  if (!getAuthCapabilities(process.env).supabase) return undefined;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_active_promotion');
  if (error || !data || data.length === 0) return undefined;
  const promo = (data as ActivePromotionRow[])[0];
  return { headline: promo.headline, description: promo.description ?? '' };
}
