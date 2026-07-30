'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const createPromotionSchema = z.object({
  headline: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountPercent: z.coerce.number().int().min(1).max(100).optional(),
  discountAmountInr: z.coerce.number().min(0).optional(),
  currency: z.string().trim().length(3).default('INR'),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function createPromotion(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = createPromotionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid promotion input');
  const { data } = parsed;

  if (data.discountType === 'percentage' && data.discountPercent === undefined) throw new Error('Discount percent is required for a percentage promotion');
  if (data.discountType === 'fixed' && data.discountAmountInr === undefined) throw new Error('Discount amount is required for a fixed promotion');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_create_promotion', {
    next_headline: data.headline,
    next_description: data.description || null,
    next_discount_type: data.discountType,
    next_discount_percent: data.discountType === 'percentage' ? data.discountPercent : null,
    next_discount_amount_paise: data.discountType === 'fixed' ? Math.round((data.discountAmountInr ?? 0) * 100) : null,
    next_currency: data.currency.toUpperCase(),
    next_starts_at: data.startsAt ? new Date(data.startsAt).toISOString() : null,
    next_ends_at: data.endsAt ? new Date(data.endsAt).toISOString() : null,
  });
  if (error) throw new Error('Unable to create promotion');
  revalidatePath('/control-center/promotions');
}

const promotionIdSchema = z.object({ promotionId: z.uuid() });

export async function activatePromotion(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = promotionIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid promotion');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_activate_promotion', { target_promotion: parsed.data.promotionId });
  if (error) throw new Error('Unable to activate promotion');
  revalidatePath('/control-center/promotions');
}

export async function deactivatePromotion(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = promotionIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid promotion');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_deactivate_promotion', { target_promotion: parsed.data.promotionId });
  if (error) throw new Error('Unable to deactivate promotion');
  revalidatePath('/control-center/promotions');
}
