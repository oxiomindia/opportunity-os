'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '../../lib/auth/dal';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export interface OnboardingState { error?: string }

function onboardingErrorMessage(code?: string) {
  if (code === '42501') return 'Your verified session is required. Sign in again and retry.';
  if (code === '23505') return 'That organization could not be created with a unique identifier. Please retry.';
  if (code === 'PGRST202') return 'Organization onboarding is not installed for this environment.';
  return 'Organization creation failed. Please try again.';
}

export async function createOrganization(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const parsed = z.object({ name: z.string().trim().min(2).max(100) }).safeParse({ name: formData.get('name') });
  if (!parsed.success) return { error: 'Organization name must be between 2 and 100 characters.' };
  const user = await requireUser();
  const slug = `${parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${crypto.randomUUID().slice(0, 8)}`;
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  console.info(JSON.stringify({
    event: 'organization.onboarding_started',
    userId: user.id,
    profileExists: Boolean(profile),
    profileLookupError: profileError ? { code: profileError.code, message: profileError.message } : null,
  }));

  const { data: organizationId, error } = await supabase.rpc('create_organization', { organization_name: parsed.data.name, organization_slug: slug });
  if (error) {
    const reference = crypto.randomUUID();
    console.error(JSON.stringify({
      event: 'organization.onboarding_failed',
      reference,
      userId: user.id,
      code: error.code ?? null,
      message: error.message,
      details: error.details ?? null,
      hint: error.hint ?? null,
    }));
    return { error: `${onboardingErrorMessage(error.code)} Reference: ${reference}` };
  }
  console.info(JSON.stringify({ event: 'organization.onboarding_completed', userId: user.id, organizationId }));
  redirect('/dashboard');
}
