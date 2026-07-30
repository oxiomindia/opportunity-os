'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const updateSettingsSchema = z.object({
  businessName: z.string().trim().max(200).optional(),
  supportEmail: z.string().trim().max(200).optional(),
  supportPhone: z.string().trim().max(40).optional(),
  whatsappNumber: z.string().trim().max(40).optional(),
  upiId: z.string().trim().max(100).optional(),
  payeeName: z.string().trim().max(200).optional(),
  brandColor: z.string().trim().max(20).optional(),
  defaultTrialDurationDays: z.coerce.number().int().min(1),
  currency: z.string().trim().length(3),
  timezone: z.string().trim().min(1).max(60),
});

export async function updateCommercialSettings(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = updateSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid settings input');
  const { data } = parsed;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_update_commercial_settings', {
    next_business_name: data.businessName || null,
    next_support_email: data.supportEmail || null,
    next_support_phone: data.supportPhone || null,
    next_whatsapp_number: data.whatsappNumber || null,
    next_upi_id: data.upiId || null,
    next_payee_name: data.payeeName || null,
    next_brand_color: data.brandColor || null,
    next_default_trial_duration_days: data.defaultTrialDurationDays,
    next_currency: data.currency.toUpperCase(),
    next_timezone: data.timezone,
  });
  if (error) throw new Error('Unable to update commercial settings');
  revalidatePath('/control-center/settings');
}
