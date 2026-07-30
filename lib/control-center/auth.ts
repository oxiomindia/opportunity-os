import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';
import type { PlatformAdminRole } from '../feedback/admin';
import { permissions } from './permissions';

/**
 * Reads the caller's platform_admins row (the same table backing
 * /control-center/feedback) and hands it to the permissions layer to decide
 * Owner-only access. No code here hardcodes "platform-admin" — that decision
 * lives entirely in lib/control-center/permissions.ts. This is the strict
 * (Owner-only) check; /control-center's own layout uses the looser
 * requirePlatformAdmin() from lib/feedback/admin.ts so all three platform
 * admin roles can reach the shell, and each Owner-only page (everything
 * except Feedback) calls requireControlCenterAccess() itself.
 */
export const getControlCenterAdmin = cache(async () => {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('platform_admins').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (!data) return null;
  const role = data.role as PlatformAdminRole;
  if (!permissions.canAccessControlCenter({ role })) return null;
  return { user, role };
});

export async function requireControlCenterAccess() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login?next=/control-center');
  const admin = await getControlCenterAdmin();
  if (!admin) redirect('/dashboard?error=forbidden');
  return admin;
}
