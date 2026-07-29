-- Oxiom Control Center — Phase 2a, Checkpoint 3 (Products & Pricing)
--
-- Effective-dated pricing: drops the mutable "active" flag from
-- commercial_product_pricing in favor of a purely time-based model — the
-- current price for a (product, plan, region) is always the row with the
-- latest effective_from that is <= now(). A future price change is
-- scheduled by inserting a row with a future effective_from and doing
-- nothing else — no update, no toggle, no race between "deactivate old"
-- and "activate new." Rows are never updated after insert (dropped
-- updated_at accordingly), so historical pricing a customer subscribed
-- under is permanently preserved.
--
-- Regional pricing: adds a region column so a future region-specific price
-- doesn't require a schema change.
--
-- Public/internal boundary: get_public_pricing() and get_active_promotion()
-- are the only way the website reads commercial data. They are SECURITY
-- DEFINER functions with an explicit column allowlist, independent of the
-- underlying tables' RLS — a future column added to those tables is
-- private by default and must be deliberately added to a function's
-- SELECT list to ever become public. Neither function exposes
-- updated_by/created_by, pricing history, or hidden products.
--
-- Runtime writes: admin_update_product_settings and
-- admin_schedule_product_price are the only way to write
-- commercial_product_settings / commercial_product_pricing at runtime.
-- Each writes an atomic commercial_audit_logs entry, honoring the
-- "no direct client insert into commercial_audit_logs" RLS from
-- migration 0017.

ALTER TABLE commercial_product_pricing DROP COLUMN active;
ALTER TABLE commercial_product_pricing DROP COLUMN updated_at;
ALTER TABLE commercial_product_pricing ADD COLUMN region text NOT NULL DEFAULT 'global';
CREATE INDEX commercial_product_pricing_lookup_idx ON commercial_product_pricing(product_id, plan_name, region, effective_from DESC);

-- Seed today's live public prices, settings, and promo banner so switching
-- the public pricing page over to these tables is a no-visible-change
-- cutover. Figures match the current lib/pricing/catalog.ts placeholder
-- exactly (prices in paise = INR * 100).
INSERT INTO commercial_product_settings (product_id, visible, badge_label)
SELECT id, true, NULL FROM platform_products WHERE slug IN ('accounts-payable','accounts-receivable','finance-suite');
INSERT INTO commercial_product_settings (product_id, visible, badge_label)
SELECT id, true, 'Early Access Add-on' FROM platform_products WHERE slug = 'itc-recovery-bot';

INSERT INTO commercial_product_pricing (product_id, monthly_price_paise, annual_price_paise)
SELECT id, 99900, 999900 FROM platform_products WHERE slug = 'accounts-payable';
INSERT INTO commercial_product_pricing (product_id, monthly_price_paise, annual_price_paise)
SELECT id, 99900, 999900 FROM platform_products WHERE slug = 'accounts-receivable';
INSERT INTO commercial_product_pricing (product_id, monthly_price_paise, annual_price_paise)
SELECT id, 199900, 1999900 FROM platform_products WHERE slug = 'finance-suite';
INSERT INTO commercial_product_pricing (product_id, monthly_price_paise, annual_price_paise)
SELECT id, 49900, 499900 FROM platform_products WHERE slug = 'itc-recovery-bot';

INSERT INTO commercial_promotions (headline, description, active)
VALUES ('Founding Customer Offer', 'Lock in launch pricing before general availability — rates increase once Oxiom exits early access.', true);

-- =========================================================================
-- Runtime write functions (Owner only, each writes an audit log entry)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.admin_update_product_settings(target_product uuid, next_visible boolean, next_status_override text, next_badge_label text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  SELECT to_jsonb(s) INTO before_row FROM commercial_product_settings s WHERE product_id = target_product;
  INSERT INTO commercial_product_settings (product_id, visible, status_override, badge_label, updated_by, updated_at)
  VALUES (target_product, next_visible, nullif(trim(next_status_override), ''), nullif(trim(next_badge_label), ''), auth.uid(), now())
  ON CONFLICT (product_id) DO UPDATE SET
    visible = excluded.visible,
    status_override = excluded.status_override,
    badge_label = excluded.badge_label,
    updated_by = excluded.updated_by,
    updated_at = now();
  SELECT to_jsonb(s) INTO after_row FROM commercial_product_settings s WHERE product_id = target_product;
  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state)
  VALUES (auth.uid(), 'product_settings.updated', 'product_settings', target_product::text, before_row, after_row);
END $$;
REVOKE ALL ON FUNCTION public.admin_update_product_settings(uuid,boolean,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_product_settings(uuid,boolean,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_schedule_product_price(target_product uuid, target_plan text, target_region text, next_monthly_paise integer, next_annual_paise integer, next_currency text, effective_at timestamptz)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE new_id uuid; plan_name_value text; region_value text; currency_value text; after_state jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  IF next_monthly_paise IS NOT NULL AND next_monthly_paise < 0 THEN RAISE EXCEPTION 'Monthly price cannot be negative' USING ERRCODE='23514'; END IF;
  IF next_annual_paise IS NOT NULL AND next_annual_paise < 0 THEN RAISE EXCEPTION 'Annual price cannot be negative' USING ERRCODE='23514'; END IF;
  plan_name_value := coalesce(nullif(trim(target_plan), ''), 'standard');
  region_value := coalesce(nullif(trim(target_region), ''), 'global');
  currency_value := coalesce(nullif(trim(next_currency), ''), 'INR');
  INSERT INTO commercial_product_pricing (product_id, plan_name, region, monthly_price_paise, annual_price_paise, currency, effective_from, created_by)
  VALUES (target_product, plan_name_value, region_value, next_monthly_paise, next_annual_paise, currency_value, coalesce(effective_at, now()), auth.uid())
  RETURNING id INTO new_id;
  after_state := jsonb_build_object('planName', plan_name_value, 'region', region_value, 'monthlyPricePaise', next_monthly_paise, 'annualPricePaise', next_annual_paise, 'currency', currency_value, 'effectiveFrom', coalesce(effective_at, now()));
  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, after_state)
  VALUES (auth.uid(), 'product_pricing.scheduled', 'product_pricing', new_id::text, after_state);
  RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.admin_schedule_product_price(uuid,text,text,integer,integer,text,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_schedule_product_price(uuid,text,text,integer,integer,text,timestamptz) TO authenticated;

-- =========================================================================
-- Public read functions (anon + authenticated — the marketing site)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_public_pricing()
RETURNS TABLE(slug text, badge_label text, status_override text, monthly_price_paise integer, annual_price_paise integer, currency text, effective_from timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT p.slug, s.badge_label, s.status_override, pr.monthly_price_paise, pr.annual_price_paise, pr.currency, pr.effective_from
  FROM platform_products p
  JOIN commercial_product_settings s ON s.product_id = p.id AND s.visible
  JOIN LATERAL (
    SELECT monthly_price_paise, annual_price_paise, currency, effective_from
    FROM commercial_product_pricing
    WHERE product_id = p.id AND plan_name = 'standard' AND region = 'global' AND effective_from <= now()
    ORDER BY effective_from DESC
    LIMIT 1
  ) pr ON true;
$$;
REVOKE ALL ON FUNCTION public.get_public_pricing() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_pricing() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_active_promotion()
RETURNS TABLE(headline text, description text, discount_percent smallint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT headline, description, discount_percent
  FROM commercial_promotions
  WHERE active AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now())
  ORDER BY created_at DESC
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_active_promotion() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_promotion() TO anon, authenticated;
