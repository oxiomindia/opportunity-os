'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const updateSettingsSchema = z.object({
  productId: z.uuid(),
  visible: z.boolean(),
  statusOverride: z.string().trim().max(60).optional(),
  badgeLabel: z.string().trim().max(60).optional(),
});

export async function updateProductSettings(formData: FormData) {
  await requireControlCenterAccess();
  // Unchecked checkboxes are simply absent from FormData, not "false" —
  // presence is the signal, not a submitted value.
  const parsed = updateSettingsSchema.safeParse({ ...Object.fromEntries(formData), visible: formData.has('visible') });
  if (!parsed.success) throw new Error('Invalid product settings');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_update_product_settings', {
    target_product: parsed.data.productId,
    next_visible: parsed.data.visible,
    next_status_override: parsed.data.statusOverride || null,
    next_badge_label: parsed.data.badgeLabel || null,
  });
  if (error) throw new Error('Unable to update product settings');
  revalidatePath('/control-center/products');
}
