import type { PlatformAdminRole } from '../feedback/admin';

export type ControlCenterRole = PlatformAdminRole;

interface PermissionSubject {
  role: ControlCenterRole;
}

function isOwner(subject: PermissionSubject | null): boolean {
  return subject?.role === 'platform-admin';
}

/**
 * Every check below currently collapses to "is the platform-admin role,"
 * because platform-admin is Phase 2a's only Owner-equivalent role. Naming
 * them separately means a future Commercial Manager or Support Manager role
 * is a change to this file only, not a codebase-wide search for
 * `role === 'platform-admin'`.
 */
export const permissions = {
  canAccessControlCenter: isOwner,
  canManageCommercial: isOwner,
  canManageProducts: isOwner,
  canManageCustomers: isOwner,
  canViewAuditLogs: isOwner,
  canManagePlatform: isOwner,
  canManageSecurity: isOwner,
} satisfies Record<string, (subject: PermissionSubject | null) => boolean>;

export type ControlCenterPermission = keyof typeof permissions;
