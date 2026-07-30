'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const schedulePriceSchema = z.object({
  productId: z.uuid(),
  planName: z.string().trim().min(1).max(40).default('standard'),
  region: z.string().trim().min(1).max(40).default('global'),
  monthlyPriceInr: z.coerce.number().min(0),
  annualPriceInr: z.coerce.number().min(0),
  currency: z.string().trim().length(3).default('INR'),
  effectiveFrom: z.string().optional(),
});

export async function schedulePrice(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = schedulePriceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid pricing input');

  const effectiveAt = parsed.data.effectiveFrom ? new Date(parsed.data.effectiveFrom) : new Date();
  if (Number.isNaN(effectiveAt.getTime())) throw new Error('Invalid effective date');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_schedule_product_price', {
    target_product: parsed.data.productId,
    target_plan: parsed.data.planName,
    target_region: parsed.data.region,
    next_monthly_paise: Math.round(parsed.data.monthlyPriceInr * 100),
    next_annual_paise: Math.round(parsed.data.annualPriceInr * 100),
    next_currency: parsed.data.currency.toUpperCase(),
    effective_at: effectiveAt.toISOString(),
  });
  if (error) throw new Error('Unable to schedule price');
  revalidatePath('/control-center/pricing');
}
