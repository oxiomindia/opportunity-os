-- Oxiom Control Center — Phase 2a, Checkpoint 2 architectural revision
-- (requested before Checkpoint 3): introduces a stable platform_products
-- identity table with a UUID primary key, and separates product
-- configuration from pricing into two tables.
--
-- commercial_product_settings and organization_commercial_profile had zero
-- rows in production when this migration was written (verified
-- immediately beforehand), so this is a structural correction, not a data
-- migration — no existing customer data is affected.

-- =========================================================================
-- platform_products: the stable identity anchor every commercial table can
-- now foreign-key against. The product's actual name, description, icon,
-- and marketing content stay in lib/products/catalog.ts — this table exists
-- only so "which product" can be a real, enforced foreign key instead of a
-- loose text match.
-- =========================================================================
CREATE TABLE platform_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX platform_products_slug_uidx ON platform_products(slug);

-- Seed the product slugs that already exist in lib/products/catalog.ts.
INSERT INTO platform_products (slug) VALUES
  ('accounts-payable'),
  ('accounts-receivable'),
  ('finance-suite'),
  ('itc-recovery-bot');

-- =========================================================================
-- commercial_product_settings: recreated with a UUID FK to platform_products
-- instead of a bare text primary key. Pricing columns removed — pricing is
-- now its own table (see below).
-- =========================================================================
DROP TABLE commercial_product_settings;

CREATE TABLE commercial_product_settings (
  product_id uuid PRIMARY KEY REFERENCES platform_products(id) ON DELETE CASCADE,
  visible boolean NOT NULL DEFAULT true,
  status_override text,
  badge_label text,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================================
-- commercial_product_pricing: pricing is a distinct commercial model, not a
-- product attribute. Supports multiple named plans per product and
-- preserves price history — superseding a price sets the old row's active
-- flag to false and inserts a new active row, rather than overwriting the
-- price a customer actually agreed to.
-- =========================================================================
CREATE TABLE commercial_product_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES platform_products(id) ON DELETE CASCADE,
  plan_name text NOT NULL DEFAULT 'standard',
  monthly_price_paise integer CHECK (monthly_price_paise IS NULL OR monthly_price_paise >= 0),
  annual_price_paise integer CHECK (annual_price_paise IS NULL OR annual_price_paise >= 0),
  currency text NOT NULL DEFAULT 'INR',
  active boolean NOT NULL DEFAULT true,
  effective_from timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX commercial_product_pricing_product_idx ON commercial_product_pricing(product_id, effective_from DESC);
-- At most one active price per (product, plan) at a time.
CREATE UNIQUE INDEX commercial_product_pricing_active_plan_uidx ON commercial_product_pricing(product_id, plan_name) WHERE active;

-- =========================================================================
-- organization_commercial_profile.current_plan_product_id: was a loose text
-- reference to the code catalog id with no referential integrity. Replaced
-- with a real FK to platform_products. No rows existed to preserve.
-- =========================================================================
ALTER TABLE organization_commercial_profile DROP COLUMN current_plan_product_id;
ALTER TABLE organization_commercial_profile
  ADD COLUMN current_plan_product_id uuid REFERENCES platform_products(id) ON DELETE SET NULL;

-- =========================================================================
-- Row Level Security — same posture as the rest of Checkpoint 2: Owner
-- (platform-admin) only. Public read access for the pricing page is a
-- Checkpoint 3 design decision (likely a narrow SECURITY DEFINER RPC
-- exposing only safe public fields) and is deliberately not decided here.
-- =========================================================================
ALTER TABLE platform_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_product_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_product_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_products_owner_all ON platform_products
  FOR ALL TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]))
  WITH CHECK (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

CREATE POLICY commercial_product_settings_owner_all ON commercial_product_settings
  FOR ALL TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]))
  WITH CHECK (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

CREATE POLICY commercial_product_pricing_owner_all ON commercial_product_pricing
  FOR ALL TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]))
  WITH CHECK (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));
