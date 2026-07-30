import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface Coupon {
  id: string;
  code: string;
  promotionId: string;
  promotionHeadline: string;
  enabled: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface PromotionOption {
  id: string;
  headline: string;
}

export async function listCoupons(): Promise<Coupon[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('coupons')
    .select('id, code, promotion_id, enabled, usage_limit, usage_count, expires_at, created_at, commercial_promotions(headline)')
    .order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load coupons');
  return (data ?? []).map((row) => {
    const promotion = Array.isArray(row.commercial_promotions) ? row.commercial_promotions[0] : row.commercial_promotions;
    return {
      id: row.id,
      code: row.code,
      promotionId: row.promotion_id,
      promotionHeadline: promotion?.headline ?? '—',
      enabled: row.enabled,
      usageLimit: row.usage_limit,
      usageCount: row.usage_count,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    };
  });
}

export async function listPromotionOptions(): Promise<PromotionOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('commercial_promotions').select('id, headline').order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load promotions');
  return (data ?? []).map((row) => ({ id: row.id, headline: row.headline }));
}
