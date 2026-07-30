import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface Promotion {
  id: string;
  headline: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountPercent: number | null;
  discountAmountPaise: number | null;
  currency: string;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export async function listPromotions(): Promise<Promotion[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('commercial_promotions')
    .select('id, headline, description, discount_type, discount_percent, discount_amount_paise, currency, active, starts_at, ends_at, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load promotions');
  return (data ?? []).map((row) => ({
    id: row.id,
    headline: row.headline,
    description: row.description,
    discountType: row.discount_type,
    discountPercent: row.discount_percent,
    discountAmountPaise: row.discount_amount_paise,
    currency: row.currency,
    active: row.active,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
  }));
}
