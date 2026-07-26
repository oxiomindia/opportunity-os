import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../supabase/server';

export type OrganizationRole = 'owner' | 'admin' | 'reviewer' | 'member' | 'viewer';

export interface SessionContext {
  user: { id: string; email: string };
  organization: { id: string; name: string; slug: string };
  role: OrganizationRole;
}

export const getAuthenticatedUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? '' };
});

export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('organization_members')
    .select('role, organizations!inner(id, name, slug)')
    .eq('user_id', user.id)
    .eq('active', true)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const organization = Array.isArray(data.organizations) ? data.organizations[0] : data.organizations;
  if (!organization) return null;
  return { user, role: data.role as OrganizationRole, organization };
});

export async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireSessionContext(roles?: readonly OrganizationRole[]) {
  const user = await requireUser();
  const context = await getSessionContext();
  if (!context) redirect('/onboarding');
  if (roles && !roles.includes(context.role)) redirect('/dashboard?error=forbidden');
  return { ...context, user };
}
