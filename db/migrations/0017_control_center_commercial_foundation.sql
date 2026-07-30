-- Oxiom Control Center — Phase 2a, Checkpoint 2 (Database Foundation)
-- Purely additive: new enums and new tables only. No existing table is
-- altered, so no backfill and no change to existing customer data or APIs.
-- Every table below is scoped to authenticated + platform-admin via
-- public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]),
-- mirroring the app-layer permissions.ts decision to treat 'platform-admin'
-- as the Owner role for Phase 2a. product-admin/security-admin get no
-- access to any table here, same as they get no Control Center UI access.

CREATE TYPE commercial_trial_status AS ENUM ('none','active','expired','converted');
CREATE TYPE commercial_subscription_status AS ENUM ('none','trialing','active','past_due','canceled');

-- =========================================================================
-- Platform-level tables (Oxiom's own commercial configuration)
-- =========================================================================

-- DB-backed overrides for the code-defined product catalog (lib/products/catalog.ts).
-- The catalog itself (name, description, icon, category) stays in code per the
-- approved architecture; this table is the real store behind what
-- lib/pricing/catalog.ts currently hardcodes as a placeholder, so Owner
-- pricing/visibility changes take effect without a deploy.
CREATE TABLE commercial_product_settings (
  product_id text PRIMARY KEY,
  visible boolean NOT NULL DEFAULT true,
  status_override text,
  monthly_price_paise integer CHECK (monthly_price_paise IS NULL OR monthly_price_paise >= 0),
  annual_price_paise integer CHECK (annual_price_paise IS NULL OR annual_price_paise >= 0),
  currency text NOT NULL DEFAULT 'INR',
  badge_label text,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Owner-controlled promotional banner for the public pricing page (e.g.
-- "Founding Customer Offer"), replacing the current hardcoded placeholder.
CREATE TABLE commercial_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  description text,
  discount_percent smallint CHECK (discount_percent IS NULL OR discount_percent BETWEEN 1 AND 100),
  active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- At most one promotion can be active at a time.
CREATE UNIQUE INDEX commercial_promotions_single_active_idx ON commercial_promotions(active) WHERE active;

-- Append-only audit trail for Control Center commercial actions (pricing
-- changes, promo changes, product visibility toggles, customer profile
-- edits). Backs the Checkpoint 5 Audit Logs module.
CREATE TABLE commercial_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX commercial_audit_logs_entity_idx ON commercial_audit_logs(entity_type, entity_id, occurred_at DESC);
CREATE INDEX commercial_audit_logs_occurred_idx ON commercial_audit_logs(occurred_at DESC);

-- =========================================================================
-- Organization-level tables (belong to individual customer organizations)
-- =========================================================================

-- Commercial-facing fields for the Customer Directory/Profile (Checkpoint 4).
-- Deliberately kept off the core `organizations` table — which is read on
-- nearly every tenant-facing request — so this migration cannot affect any
-- existing tenant code path. A missing row means "no commercial data yet";
-- no backfill is required for existing organizations.
CREATE TABLE organization_commercial_profile (
  organization_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  gst_number text,
  contact_person text,
  contact_mobile text,
  city text,
  country text,
  trial_status commercial_trial_status NOT NULL DEFAULT 'none',
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  subscription_status commercial_subscription_status NOT NULL DEFAULT 'none',
  current_plan_product_id text,
  renewal_date date,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX organization_commercial_profile_trial_idx ON organization_commercial_profile(trial_status);
CREATE INDEX organization_commercial_profile_subscription_idx ON organization_commercial_profile(subscription_status);

-- Owner's internal notes on a customer organization (Customer Profile
-- requirement). Append-only, mirrors the existing feedback_admin_notes shape.
CREATE TABLE customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  note text NOT NULL CHECK (length(trim(note)) BETWEEN 2 AND 4000),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customer_notes_org_idx ON customer_notes(organization_id, created_at DESC);

-- Chronological lifecycle events per customer organization (trial requests,
-- approvals, first login, subscription purchases, upgrades, renewals,
-- suspensions, ...) for the approved Customer Timeline feature. event_type
-- is free text, not an enum, because the event set is explicitly open-ended
-- and new event types should not require a migration.
CREATE TABLE customer_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_summary text NOT NULL,
  metadata jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customer_timeline_events_org_idx ON customer_timeline_events(organization_id, occurred_at DESC);

-- =========================================================================
-- Row Level Security
-- =========================================================================

ALTER TABLE commercial_product_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_commercial_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_timeline_events ENABLE ROW LEVEL SECURITY;

-- commercial_product_settings: Owner can read and manage directly (simple
-- config table, no compound side effects to protect).
CREATE POLICY commercial_product_settings_owner_all ON commercial_product_settings
  FOR ALL TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]))
  WITH CHECK (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

-- commercial_promotions: same — direct Owner CRUD.
CREATE POLICY commercial_promotions_owner_all ON commercial_promotions
  FOR ALL TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]))
  WITH CHECK (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

-- commercial_audit_logs: Owner can read; deliberately NO insert/update/delete
-- policy for `authenticated` at all. Rows can only be written by
-- SECURITY DEFINER functions or service-role server code (added as the
-- write-side actions are implemented in later checkpoints), so an actor
-- being audited can never edit their own audit trail through the API.
CREATE POLICY commercial_audit_logs_owner_read ON commercial_audit_logs
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

-- organization_commercial_profile: Owner-only, not organization members —
-- this is commercial/Owner-controlled data with no tenant-facing feature
-- reading or writing it in Phase 2a.
CREATE POLICY organization_commercial_profile_owner_all ON organization_commercial_profile
  FOR ALL TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]))
  WITH CHECK (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

-- customer_notes: Owner read + insert-as-self, matching feedback_admin_notes.
-- No update/delete — an append-only note log.
CREATE POLICY customer_notes_owner_read ON customer_notes
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));
CREATE POLICY customer_notes_owner_insert ON customer_notes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) AND created_by = auth.uid());

-- customer_timeline_events: Owner can read; no insert policy for
-- `authenticated`. Timeline rows are system/Owner-recorded via
-- SECURITY DEFINER functions when the actions that generate them (trial
-- approval, subscription changes, ...) are built in later checkpoints.
CREATE POLICY customer_timeline_events_owner_read ON customer_timeline_events
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));
