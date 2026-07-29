import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';
import type { PlatformAdminRole } from '../feedback/admin';

/**
 * Owner-level gate for the Oxiom Control Center. Reuses the existing
 * platform_admins table (already backing /admin/feedback) rather than a new
 * role primitive — 'platform-admin' is the highest of its three roles, so it
 * stands in for "Owner" until a dedicated role is introduced.
 */
export const getControlCenterAdmin = cache(async () => {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('platform_admins').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (!data || data.role !== 'platform-admin') return null;
  return { user, role: data.role as PlatformAdminRole };
});

export async function requireControlCenterAccess() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login?next=/control-center');
  const admin = await getControlCenterAdmin();
  if (!admin) redirect('/dashboard?error=forbidden');
  return admin;
}
