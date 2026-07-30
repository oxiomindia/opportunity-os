'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

function revalidateTrial(trialId?: string) {
  revalidatePath('/control-center/trials');
  revalidatePath('/control-center');
  if (trialId) revalidatePath(`/control-center/trials/${trialId}`);
}

const requestTrialSchema = z.object({
  organizationId: z.uuid(),
  productId: z.uuid(),
  contactPerson: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().max(320).optional(),
  contactMobile: z.string().trim().max(20).optional(),
});

export async function requestTrial(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = requestTrialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid trial request input');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_request_trial', {
    target_org: parsed.data.organizationId,
    target_product: parsed.data.productId,
    contact_person: parsed.data.contactPerson || null,
    contact_email: parsed.data.contactEmail || null,
    contact_mobile: parsed.data.contactMobile || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to log trial request');
  revalidateTrial();
}

const trialIdSchema = z.object({ trialId: z.uuid() });

export async function setTrialUnderReview(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = trialIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid trial');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_set_trial_under_review', {
    target_trial: parsed.data.trialId,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to update trial');
  revalidateTrial(parsed.data.trialId);
}

const approveTrialSchema = z.object({
  trialId: z.uuid(),
  durationDays: z.coerce.number().int().min(1).max(365).default(7),
  reason: z.string().trim().max(500).optional(),
});

export async function approveTrial(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = approveTrialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid trial approval input');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_approve_trial', {
    target_trial: parsed.data.trialId,
    duration_days: parsed.data.durationDays,
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to approve trial');
  revalidateTrial(parsed.data.trialId);
}

const rejectTrialSchema = z.object({
  trialId: z.uuid(),
  rejectedReason: z.string().trim().min(2).max(500),
});

export async function rejectTrial(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = rejectTrialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('A rejection reason is required');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_reject_trial', {
    target_trial: parsed.data.trialId,
    rejected_reason: parsed.data.rejectedReason,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to reject trial');
  revalidateTrial(parsed.data.trialId);
}

const extendTrialSchema = z.object({
  trialId: z.uuid(),
  newEndsAt: z.string().min(1),
  reason: z.string().trim().max(500).optional(),
});

export async function extendTrial(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = extendTrialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid extension input');
  const newEndsAt = new Date(parsed.data.newEndsAt);
  if (Number.isNaN(newEndsAt.getTime())) throw new Error('Invalid end date');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_extend_trial', {
    target_trial: parsed.data.trialId,
    new_ends_at: newEndsAt.toISOString(),
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to extend trial');
  revalidateTrial(parsed.data.trialId);
}

const expireTrialSchema = z.object({
  trialId: z.uuid(),
  reason: z.string().trim().max(500).optional(),
});

export async function expireTrial(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = expireTrialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid trial');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_expire_trial', {
    target_trial: parsed.data.trialId,
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to expire trial');
  revalidateTrial(parsed.data.trialId);
}

const convertTrialSchema = z.object({
  trialId: z.uuid(),
  planId: z.uuid(),
  reason: z.string().trim().max(500).optional(),
});

export async function convertTrial(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = convertTrialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid conversion input');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_convert_trial', {
    target_trial: parsed.data.trialId,
    target_plan: parsed.data.planId,
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to convert trial');
  revalidateTrial(parsed.data.trialId);
  revalidatePath('/control-center/customers');
}

const addTrialNoteSchema = z.object({
  trialId: z.uuid(),
  note: z.string().trim().min(2).max(4000),
});

export async function addTrialNote(formData: FormData) {
  const admin = await requireControlCenterAccess();
  const parsed = addTrialNoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid note');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('trial_notes').insert({
    trial_id: parsed.data.trialId,
    note: parsed.data.note,
    created_by: admin.user.id,
  });
  if (error) throw new Error('Unable to add note');
  revalidatePath(`/control-center/trials/${parsed.data.trialId}`);
}
