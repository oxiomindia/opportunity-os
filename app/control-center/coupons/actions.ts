'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const generateCouponSchema = z.object({
  promotionId: z.uuid(),
  code: z.string().trim().max(40).optional(),
  usageLimit: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
});

export async function generateCoupon(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = generateCouponSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid coupon input');
  const { data } = parsed;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_generate_coupon', {
    target_promotion: data.promotionId,
    next_code: data.code || null,
    next_usage_limit: data.usageLimit ?? null,
    next_expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
  });
  if (error) throw new Error('Unable to generate coupon');
  revalidatePath('/control-center/coupons');
}

const setCouponEnabledSchema = z.object({
  couponId: z.uuid(),
  enabled: z.coerce.boolean(),
});

export async function setCouponEnabled(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = setCouponEnabledSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid coupon');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_set_coupon_enabled', {
    target_coupon: parsed.data.couponId,
    next_enabled: parsed.data.enabled,
  });
  if (error) throw new Error('Unable to update coupon');
  revalidatePath('/control-center/coupons');
}
