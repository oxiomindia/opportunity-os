-- Oxiom Control Center — Phase 2a, Checkpoint 3 follow-up
--
-- The project has a default privilege on the public schema
-- (ALTER DEFAULT PRIVILEGES ... GRANT EXECUTE ON FUNCTIONS TO anon,
-- authenticated, service_role) that auto-grants EXECUTE to anon on every
-- new function at CREATE time. "REVOKE ALL ... FROM PUBLIC" (used in this
-- migration set and in the pre-existing 0004 migration) only revokes the
-- PUBLIC pseudo-grant — it does not touch the real per-role anon grant the
-- default ACL already applied. Confirmed live: anon could reach the body
-- of admin_update_product_settings / admin_schedule_product_price and was
-- only stopped by their internal is_platform_admin() check, not by the
-- database's own grant system.
--
-- The internal check meant no unauthorized write was ever actually
-- possible, but the grant surface was broader than intended. This
-- explicitly revokes anon's EXECUTE on the two admin-only functions added
-- in migration 0019, so the database itself is the first line of defense,
-- not just the function body.
--
-- Note: this same default-ACL gap likely affects the pre-existing
-- admin_update_feedback / admin_assign_feedback functions from migration
-- 0004 too. Left untouched here deliberately — that's a different,
-- already-shipped subsystem outside Checkpoint 3's scope.

REVOKE EXECUTE ON FUNCTION public.admin_update_product_settings(uuid,boolean,text,text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_schedule_product_price(uuid,text,text,integer,integer,text,timestamptz) FROM anon;
