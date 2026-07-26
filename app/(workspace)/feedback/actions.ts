'use server';

import { headers } from 'next/headers';
import { feedbackInputSchema, detectUrgency } from '../../../lib/feedback/model';
import { getSessionContext } from '../../../lib/auth/dal';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export interface FeedbackState { success?: boolean; feedbackId?: string; error?: string; fieldErrors?: Record<string, string[]> }

export async function submitFeedback(_state: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const session = await getSessionContext();
  if (!session) return { error: 'Your session has expired. Sign in and try again.' };
  const parsed = feedbackInputSchema.safeParse({
    pros: formData.get('pros'), cons: formData.get('cons'), category: formData.get('category'), featureArea: formData.get('featureArea'),
    sourceRoute: formData.get('sourceRoute') || null, rating: formData.get('rating') || null,
    mayContact: formData.get('mayContact') === 'on', anonymous: formData.get('anonymous') === 'on', idempotencyKey: formData.get('idempotencyKey'),
  });
  if (!parsed.success) return { error: 'Review the highlighted fields and try again.', fieldErrors: parsed.error.flatten().fieldErrors };
  const urgent = detectUrgency(parsed.data);
  const contentHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${parsed.data.pros ?? ''}\0${parsed.data.cons ?? ''}\0${parsed.data.category}`))), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const headerStore = await headers();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('submit_feedback', {
    target_organization: session.organization.id, feedback_pros: parsed.data.pros ?? '', feedback_cons: parsed.data.cons ?? '',
    feedback_category: parsed.data.category, feedback_feature: parsed.data.featureArea ?? '', feedback_route: parsed.data.sourceRoute,
    feedback_rating: parsed.data.rating, contact_allowed: parsed.data.mayContact, product_anonymous: parsed.data.anonymous,
    request_key: parsed.data.idempotencyKey, urgent: urgent.urgent, urgent_reason: urgent.reason,
    suggested_priority: urgent.suggestedPriority, product_version: process.env.npm_package_version ?? 'unknown',
    user_agent: headerStore.get('user-agent') ?? 'unknown', feedback_hash: contentHash,
  });
  if (error) {
    console.error(JSON.stringify({ event: 'feedback.submission_failed', requestId: parsed.data.idempotencyKey, organizationId: session.organization.id, code: error.code }));
    const duplicate = error.message.includes('Duplicate feedback');
    const limited = error.message.includes('Rate limit');
    return { error: duplicate ? 'This feedback was already recorded recently.' : limited ? 'You have submitted several items recently. Please try again later.' : 'Feedback could not be recorded. Please try again.' };
  }
  console.info(JSON.stringify({ event: 'feedback.submitted', requestId: parsed.data.idempotencyKey, feedbackId: data, organizationId: session.organization.id, urgent: urgent.urgent }));
  return { success: true, feedbackId: data as string };
}
