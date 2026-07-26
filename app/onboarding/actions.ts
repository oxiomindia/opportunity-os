'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '../../lib/auth/dal';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export interface OnboardingState { error?: string }

export async function createOrganization(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const parsed = z.object({ name: z.string().trim().min(2).max(100) }).safeParse({ name: formData.get('name') });
  if (!parsed.success) return { error: 'Organization name must be between 2 and 100 characters.' };
  const user = await requireUser();
  const slug = `${parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${crypto.randomUUID().slice(0, 8)}`;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('create_organization', { organization_name: parsed.data.name, organization_slug: slug });
  if (error) {
    console.error('Organization onboarding failed', { userId: user.id, code: error.code });
    return { error: 'Organization creation failed. Please try again.' };
  }
  redirect('/dashboard');
}
