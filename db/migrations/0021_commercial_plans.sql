-- Oxiom Control Center — Phase 2a, architectural enhancement requested
-- before Checkpoint 4: introduces "Commercial Plans" as a first-class layer
-- between Product and Pricing History.
--
--   Product -> Commercial Plan -> Price History
--
-- Today every product has exactly one plan ("Standard"), seeded below, but
-- the shape now naturally supports Professional/Enterprise tiers, partner
-- editions, and legacy plans without another schema change. Customer
-- subscriptions (organization_commercial_profile.current_plan_id) now
-- reference a Plan, not a Product directly, preserving the exact
-- commercial agreement a customer subscribed under even if the product
-- later grows additional plans.
--
-- commercial_product_pricing had exactly 4 rows (the Checkpoint 3 seed,
-- all plan_name='standard') when this was written — backfilled below, not
-- dropped and recreated, since real product_id has to survive into plan_id.

CREATE TABLE commercial_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES platform_products(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  -- Free text, not an enum, for the same reason as commercial_product_settings.status_override:
  -- 'active' | 'legacy' | 'retired' today, but a future lifecycle state is just a new string.
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX commercial_plans_product_code_uidx ON commercial_plans(product_id, code);

-- Every existing product gets a Standard plan so today's pricing has
-- somewhere to attach.
INSERT INTO commercial_plans (product_id, code, name)
SELECT id, 'standard', 'Standard' FROM platform_products;

ALTER TABLE commercial_product_pricing ADD COLUMN plan_id uuid REFERENCES commercial_plans(id) ON DELETE CASCADE;
UPDATE commercial_product_pricing pr
SET plan_id = cp.id
FROM commercial_plans cp
WHERE cp.product_id = pr.product_id AND cp.code = pr.plan_name;

ALTER TABLE commercial_product_pricing ALTER COLUMN plan_id SET NOT NULL;
DROP INDEX commercial_product_pricing_lookup_idx;
ALTER TABLE commercial_product_pricing DROP COLUMN product_id;
ALTER TABLE commercial_product_pricing DROP COLUMN plan_name;
CREATE INDEX commercial_product_pricing_lookup_idx ON commercial_product_pricing(plan_id, region, effective_from DESC);

-- Customers subscribe to a Plan, not a Product.
ALTER TABLE organization_commercial_profile DROP COLUMN current_plan_product_id;
ALTER TABLE organization_commercial_profile ADD COLUMN current_plan_id uuid REFERENCES commercial_plans(id) ON DELETE SET NULL;

ALTER TABLE commercial_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY commercial_plans_owner_all ON commercial_plans
  FOR ALL TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]))
  WITH CHECK (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

-- =========================================================================
-- Audit log enrichment: Reason and Request/Correlation ID, both optional.
-- =========================================================================
ALTER TABLE commercial_audit_logs ADD COLUMN reason text;
ALTER TABLE commercial_audit_logs ADD COLUMN request_id text;

-- =========================================================================
-- Update the write/read functions for the new Product -> Plan -> Pricing
-- shape. Both admin_* signatures are unchanged in their existing
-- parameters (so the Checkpoint 3 UI keeps working with zero changes) plus
-- two new optional trailing parameters. Adding parameters is a new
-- overload in Postgres, not a true REPLACE, so the old 7/4-arg versions
-- are dropped first to avoid leaving a duplicate, differently-grinted
-- signature behind.
-- =========================================================================

DROP FUNCTION IF EXISTS public.admin_schedule_product_price(uuid,text,text,integer,integer,text,timestamptz);

CREATE FUNCTION public.admin_schedule_product_price(target_product uuid, target_plan text, target_region text, next_monthly_paise integer, next_annual_paise integer, next_currency text, effective_at timestamptz, change_reason text DEFAULT NULL, request_id text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE new_id uuid; plan_code text; region_value text; currency_value text; resolved_plan_id uuid; after_state jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  IF next_monthly_paise IS NOT NULL AND next_monthly_paise < 0 THEN RAISE EXCEPTION 'Monthly price cannot be negative' USING ERRCODE='23514'; END IF;
  IF next_annual_paise IS NOT NULL AND next_annual_paise < 0 THEN RAISE EXCEPTION 'Annual price cannot be negative' USING ERRCODE='23514'; END IF;

  plan_code := coalesce(nullif(trim(target_plan), ''), 'standard');
  region_value := coalesce(nullif(trim(target_region), ''), 'global');
  currency_value := coalesce(nullif(trim(next_currency), ''), 'INR');

  SELECT id INTO resolved_plan_id FROM commercial_plans WHERE product_id = target_product AND code = plan_code;
  IF resolved_plan_id IS NULL THEN
    INSERT INTO commercial_plans (product_id, code, name) VALUES (target_product, plan_code, initcap(replace(plan_code, '-', ' '))) RETURNING id INTO resolved_plan_id;
  END IF;

  INSERT INTO commercial_product_pricing (plan_id, region, monthly_price_paise, annual_price_paise, currency, effective_from, created_by)
  VALUES (resolved_plan_id, region_value, next_monthly_paise, next_annual_paise, currency_value, coalesce(effective_at, now()), auth.uid())
  RETURNING id INTO new_id;

  after_state := jsonb_build_object('planId', resolved_plan_id, 'planCode', plan_code, 'region', region_value, 'monthlyPricePaise', next_monthly_paise, 'annualPricePaise', next_annual_paise, 'currency', currency_value, 'effectiveFrom', coalesce(effective_at, now()));
  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, after_state, reason, request_id)
  VALUES (auth.uid(), 'product_pricing.scheduled', 'product_pricing', new_id::text, after_state, change_reason, admin_schedule_product_price.request_id);
  RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.admin_schedule_product_price(uuid,text,text,integer,integer,text,timestamptz,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_schedule_product_price(uuid,text,text,integer,integer,text,timestamptz,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_schedule_product_price(uuid,text,text,integer,integer,text,timestamptz,text,text) FROM anon;

DROP FUNCTION IF EXISTS public.admin_update_product_settings(uuid,boolean,text,text);

CREATE FUNCTION public.admin_update_product_settings(target_product uuid, next_visible boolean, next_status_override text, next_badge_label text, change_reason text DEFAULT NULL, request_id text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  SELECT to_jsonb(s) INTO before_row FROM commercial_product_settings s WHERE product_id = target_product;
  INSERT INTO commercial_product_settings (product_id, visible, status_override, badge_label, updated_by, updated_at)
  VALUES (target_product, next_visible, nullif(trim(next_status_override), ''), nullif(trim(next_badge_label), ''), auth.uid(), now())
  ON CONFLICT (product_id) DO UPDATE SET
    visible = excluded.visible, status_override = excluded.status_override, badge_label = excluded.badge_label,
    updated_by = excluded.updated_by, updated_at = now();
  SELECT to_jsonb(s) INTO after_row FROM commercial_product_settings s WHERE product_id = target_product;
  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'product_settings.updated', 'product_settings', target_product::text, before_row, after_row, change_reason, admin_update_product_settings.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_update_product_settings(uuid,boolean,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_product_settings(uuid,boolean,text,text,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_product_settings(uuid,boolean,text,text,text,text) FROM anon;

CREATE OR REPLACE FUNCTION public.get_public_pricing()
RETURNS TABLE(slug text, badge_label text, status_override text, monthly_price_paise integer, annual_price_paise integer, currency text, effective_from timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT p.slug, s.badge_label, s.status_override, pr.monthly_price_paise, pr.annual_price_paise, pr.currency, pr.effective_from
  FROM platform_products p
  JOIN commercial_product_settings s ON s.product_id = p.id AND s.visible
  JOIN commercial_plans cp ON cp.product_id = p.id AND cp.code = 'standard' AND cp.status = 'active'
  JOIN LATERAL (
    SELECT monthly_price_paise, annual_price_paise, currency, effective_from
    FROM commercial_product_pricing
    WHERE plan_id = cp.id AND region = 'global' AND effective_from <= now()
    ORDER BY effective_from DESC
    LIMIT 1
  ) pr ON true;
$$;
-- CREATE OR REPLACE preserves the existing anon/authenticated grants from migration 0019 — no re-grant needed.
