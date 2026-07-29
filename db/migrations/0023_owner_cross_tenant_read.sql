-- Oxiom Control Center — Phase 2a, Checkpoint 4 (Customers) follow-up
--
-- organizations, organization_members, and profiles predate the Control
-- Center and only ever had member-scoped RLS (you can read your own
-- organization's data, nothing else). The Customer Directory needs to read
-- across every organization, which none of the existing policies allow —
-- confirmed by inspecting the policies before writing the Directory query,
-- not discovered after shipping it.
--
-- These are purely additive SELECT policies for the Owner
-- (platform-admin). RLS policies are OR'd together, so existing
-- member-scoped access is completely unaffected — a regular organization
-- member still only ever sees their own organization's data.

CREATE POLICY organizations_owner_read ON organizations
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

CREATE POLICY organization_members_owner_read ON organization_members
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

CREATE POLICY profiles_owner_read ON profiles
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));
