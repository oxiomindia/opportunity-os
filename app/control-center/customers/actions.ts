'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const trialStatuses = ['none', 'active', 'expired', 'converted'] as const;
const subscriptionStatuses = ['none', 'trialing', 'active', 'past_due', 'canceled'] as const;

const updateProfileSchema = z.object({
  organizationId: z.uuid(),
  gstNumber: z.string().trim().max(30).optional(),
  contactPerson: z.string().trim().max(120).optional(),
  contactMobile: z.string().trim().max(20).optional(),
  city: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  trialStatus: z.enum(trialStatuses),
  trialStartedAt: z.string().optional(),
  trialEndsAt: z.string().optional(),
  subscriptionStatus: z.enum(subscriptionStatuses),
  currentPlanId: z.string().optional(),
  renewalDate: z.string().optional(),
  reason: z.string().trim().max(500).optional(),
});

export async function updateCustomerProfile(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = updateProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid customer profile input');
  const data = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_update_customer_profile', {
    target_org: data.organizationId,
    next_gst_number: data.gstNumber || null,
    next_contact_person: data.contactPerson || null,
    next_contact_mobile: data.contactMobile || null,
    next_city: data.city || null,
    next_country: data.country || null,
    next_trial_status: data.trialStatus,
    next_trial_started_at: data.trialStartedAt || null,
    next_trial_ends_at: data.trialEndsAt || null,
    next_subscription_status: data.subscriptionStatus,
    next_current_plan_id: data.currentPlanId || null,
    next_renewal_date: data.renewalDate || null,
    change_reason: data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to update customer profile');
  revalidatePath(`/control-center/customers/${data.organizationId}`);
  revalidatePath('/control-center/customers');
}

const addNoteSchema = z.object({
  organizationId: z.uuid(),
  note: z.string().trim().min(2).max(4000),
});

export async function addCustomerNote(formData: FormData) {
  const admin = await requireControlCenterAccess();
  const parsed = addNoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid note');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('customer_notes').insert({
    organization_id: parsed.data.organizationId,
    note: parsed.data.note,
    created_by: admin.user.id,
  });
  if (error) throw new Error('Unable to add note');
  revalidatePath(`/control-center/customers/${parsed.data.organizationId}`);
}
