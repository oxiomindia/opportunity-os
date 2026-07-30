'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

function revalidateSubscription(subscriptionId?: string) {
  revalidatePath('/control-center/subscriptions');
  revalidatePath('/control-center');
  revalidatePath('/control-center/customers');
  if (subscriptionId) revalidatePath(`/control-center/subscriptions/${subscriptionId}`);
}

const billingCycles = ['monthly', 'annual'] as const;

const createSubscriptionSchema = z.object({
  organizationId: z.uuid(),
  planId: z.uuid(),
  billingCycle: z.enum(billingCycles).default('monthly'),
  startDate: z.string().optional(),
  region: z.string().trim().max(40).optional(),
});

export async function createSubscription(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = createSubscriptionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid subscription input');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_create_subscription', {
    target_org: parsed.data.organizationId,
    target_plan: parsed.data.planId,
    billing_cycle: parsed.data.billingCycle,
    start_date: parsed.data.startDate || undefined,
    region: parsed.data.region || undefined,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to create subscription');
  revalidateSubscription();
}

const changePlanSchema = z.object({
  subscriptionId: z.uuid(),
  planId: z.uuid(),
  reason: z.string().trim().max(500).optional(),
});

export async function upgradeSubscription(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = changePlanSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid upgrade input');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_upgrade_subscription', {
    target_subscription: parsed.data.subscriptionId,
    target_plan: parsed.data.planId,
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to upgrade subscription');
  revalidateSubscription(parsed.data.subscriptionId);
}

export async function downgradeSubscription(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = changePlanSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid downgrade input');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_downgrade_subscription', {
    target_subscription: parsed.data.subscriptionId,
    target_plan: parsed.data.planId,
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to downgrade subscription');
  revalidateSubscription(parsed.data.subscriptionId);
}

const reasonSchema = z.object({
  subscriptionId: z.uuid(),
  reason: z.string().trim().max(500).optional(),
});

export async function suspendSubscription(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = reasonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid subscription');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_suspend_subscription', {
    target_subscription: parsed.data.subscriptionId,
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to suspend subscription');
  revalidateSubscription(parsed.data.subscriptionId);
}

export async function cancelSubscription(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = reasonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid subscription');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_cancel_subscription', {
    target_subscription: parsed.data.subscriptionId,
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to cancel subscription');
  revalidateSubscription(parsed.data.subscriptionId);
}

export async function reactivateSubscription(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = reasonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid subscription');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_reactivate_subscription', {
    target_subscription: parsed.data.subscriptionId,
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to reactivate subscription');
  revalidateSubscription(parsed.data.subscriptionId);
}

export async function expireSubscription(formData: FormData) {
  await requireControlCenterAccess();
  const parsed = reasonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid subscription');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_expire_subscription', {
    target_subscription: parsed.data.subscriptionId,
    change_reason: parsed.data.reason || null,
    request_id: crypto.randomUUID(),
  });
  if (error) throw new Error('Unable to expire subscription');
  revalidateSubscription(parsed.data.subscriptionId);
}
