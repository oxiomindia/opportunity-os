-- Oxiom Control Center — Phase 2b, Checkpoint 2 (Subscriptions), part 2 of 2.
-- Migration 0026 added the two new commercial_subscription_status enum
-- values this migration relies on — see that file for why it's separate.
--
-- subscriptions is now the commercial source of truth: an organization can
-- hold many concurrent subscriptions (one-to-many), each belonging to
-- exactly one Commercial Plan — the relationship
-- organization_commercial_profile.primary_plan_id was always documented as
-- a stand-in for (migration 0024). No price is stored on a subscription;
-- price is always read live from commercial_product_pricing via plan_id,
-- the same way the public /pricing page already does.
--
-- Status/actions: active -> suspended -> reactivate -> active,
-- active|suspended -> cancelled -> reactivate -> active,
-- active|suspended -> expired (terminal). Upgrade/downgrade only change the
-- plan on an active subscription. Suspend and Expire weren't named as
-- explicit actions in the brief, but are required to reach the Suspended
-- and Expired states the brief does list — added for completeness, mirroring
-- Trials' admin_expire_trial (no background scheduler exists, so expiry is
-- an explicit Owner action here too).
--
-- organization_commercial_profile.subscription_status/primary_plan_id/renewal_date
-- remain the Customer Directory's headline cache of "the most recently
-- touched subscription" — kept in sync by the RPCs below. Every existing
-- write path to these three columns is removed from
-- admin_update_customer_profile in this same migration, for the same
-- reason the trial fields were removed from it in migration 0025: once a
-- module really owns a concern, a second, uncoordinated write path is a
-- correctness risk, not a convenience.
--
-- commercial_subscription_status already spells its cancelled state
-- 'canceled' (single L); the new subscriptions.status enum below spells it
-- 'cancelled' (double L, matching the brief) since it's an independent
-- type — a disclosed, harmless inconsistency rather than a destructive
-- rename of a production enum.

CREATE TYPE subscription_lifecycle_status AS ENUM ('active','suspended','cancelled','expired');
CREATE TYPE subscription_billing_cycle AS ENUM ('monthly','annual');

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES commercial_plans(id),
  status subscription_lifecycle_status NOT NULL DEFAULT 'active',
  billing_cycle subscription_billing_cycle NOT NULL DEFAULT 'monthly',
  region text NOT NULL DEFAULT 'global',
  start_date date NOT NULL,
  renewal_date date,
  source_trial_id uuid REFERENCES trials(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_org_idx ON subscriptions(organization_id, created_at DESC);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);
CREATE INDEX subscriptions_plan_idx ON subscriptions(plan_id);

CREATE TABLE subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_summary text NOT NULL,
  metadata jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES profiles(id)
);
CREATE INDEX subscription_events_subscription_idx ON subscription_events(subscription_id, occurred_at DESC);

-- =========================================================================
-- Row Level Security
-- =========================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_owner_read ON subscriptions
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

CREATE POLICY subscription_events_owner_read ON subscription_events
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

-- =========================================================================
-- RPCs
-- =========================================================================

CREATE FUNCTION public.admin_create_subscription(
  target_org uuid,
  target_plan uuid,
  billing_cycle subscription_billing_cycle DEFAULT 'monthly',
  start_date date DEFAULT current_date,
  region text DEFAULT 'global',
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE new_subscription_id uuid; v_renewal_date date; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  v_renewal_date := (CASE admin_create_subscription.billing_cycle
    WHEN 'annual' THEN admin_create_subscription.start_date + INTERVAL '1 year'
    ELSE admin_create_subscription.start_date + INTERVAL '1 month'
  END)::date;

  INSERT INTO subscriptions (organization_id, plan_id, billing_cycle, region, start_date, renewal_date, created_by)
  VALUES (target_org, target_plan, admin_create_subscription.billing_cycle, admin_create_subscription.region, admin_create_subscription.start_date, v_renewal_date, auth.uid())
  RETURNING id INTO new_subscription_id;
  SELECT to_jsonb(s) INTO after_row FROM subscriptions s WHERE s.id = new_subscription_id;

  INSERT INTO subscription_events (subscription_id, event_type, event_summary, recorded_by)
  VALUES (new_subscription_id, 'created', format('Subscription created (%s billing)', admin_create_subscription.billing_cycle::text), auth.uid());

  INSERT INTO organization_commercial_profile (organization_id, subscription_status, primary_plan_id, renewal_date, updated_by, updated_at)
  VALUES (target_org, 'active', target_plan, v_renewal_date, auth.uid(), now())
  ON CONFLICT (organization_id) DO UPDATE SET
    subscription_status = 'active', primary_plan_id = excluded.primary_plan_id, renewal_date = excluded.renewal_date,
    updated_by = excluded.updated_by, updated_at = now();

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (target_org, 'subscription_created', 'Subscription created', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'subscription.created', 'subscriptions', new_subscription_id::text, NULL, after_row, change_reason, admin_create_subscription.request_id);

  RETURN new_subscription_id;
END $$;
REVOKE ALL ON FUNCTION public.admin_create_subscription(uuid,uuid,subscription_billing_cycle,date,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_subscription(uuid,uuid,subscription_billing_cycle,date,text,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_create_subscription(uuid,uuid,subscription_billing_cycle,date,text,text,text) FROM anon;

CREATE FUNCTION public.admin_upgrade_subscription(
  target_subscription uuid,
  target_plan uuid,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status subscription_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT s.status, s.organization_id, to_jsonb(s) INTO v_status, v_org, before_row FROM subscriptions s WHERE s.id = target_subscription FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Subscription not found'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Only an active subscription can be upgraded'; END IF;

  UPDATE subscriptions SET plan_id = target_plan, updated_at = now() WHERE id = target_subscription;
  SELECT to_jsonb(s) INTO after_row FROM subscriptions s WHERE s.id = target_subscription;

  INSERT INTO subscription_events (subscription_id, event_type, event_summary, recorded_by)
  VALUES (target_subscription, 'upgraded', 'Subscription upgraded to a new plan', auth.uid());

  UPDATE organization_commercial_profile SET primary_plan_id = target_plan, updated_by = auth.uid(), updated_at = now() WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'subscription_upgraded', 'Subscription upgraded to a new plan', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'subscription.upgraded', 'subscriptions', target_subscription::text, before_row, after_row, change_reason, admin_upgrade_subscription.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_upgrade_subscription(uuid,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_upgrade_subscription(uuid,uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_upgrade_subscription(uuid,uuid,text,text) FROM anon;

CREATE FUNCTION public.admin_downgrade_subscription(
  target_subscription uuid,
  target_plan uuid,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status subscription_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT s.status, s.organization_id, to_jsonb(s) INTO v_status, v_org, before_row FROM subscriptions s WHERE s.id = target_subscription FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Subscription not found'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Only an active subscription can be downgraded'; END IF;

  UPDATE subscriptions SET plan_id = target_plan, updated_at = now() WHERE id = target_subscription;
  SELECT to_jsonb(s) INTO after_row FROM subscriptions s WHERE s.id = target_subscription;

  INSERT INTO subscription_events (subscription_id, event_type, event_summary, recorded_by)
  VALUES (target_subscription, 'downgraded', 'Subscription downgraded to a new plan', auth.uid());

  UPDATE organization_commercial_profile SET primary_plan_id = target_plan, updated_by = auth.uid(), updated_at = now() WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'subscription_downgraded', 'Subscription downgraded to a new plan', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'subscription.downgraded', 'subscriptions', target_subscription::text, before_row, after_row, change_reason, admin_downgrade_subscription.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_downgrade_subscription(uuid,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_downgrade_subscription(uuid,uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_downgrade_subscription(uuid,uuid,text,text) FROM anon;

CREATE FUNCTION public.admin_suspend_subscription(
  target_subscription uuid,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status subscription_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT s.status, s.organization_id, to_jsonb(s) INTO v_status, v_org, before_row FROM subscriptions s WHERE s.id = target_subscription FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Subscription not found'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Only an active subscription can be suspended'; END IF;

  UPDATE subscriptions SET status = 'suspended', updated_at = now() WHERE id = target_subscription;
  SELECT to_jsonb(s) INTO after_row FROM subscriptions s WHERE s.id = target_subscription;

  INSERT INTO subscription_events (subscription_id, event_type, event_summary, recorded_by)
  VALUES (target_subscription, 'suspended', 'Subscription suspended', auth.uid());

  UPDATE organization_commercial_profile SET subscription_status = 'suspended', updated_by = auth.uid(), updated_at = now() WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'subscription_suspended', 'Subscription suspended', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'subscription.suspended', 'subscriptions', target_subscription::text, before_row, after_row, change_reason, admin_suspend_subscription.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_suspend_subscription(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_suspend_subscription(uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_suspend_subscription(uuid,text,text) FROM anon;

CREATE FUNCTION public.admin_cancel_subscription(
  target_subscription uuid,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status subscription_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT s.status, s.organization_id, to_jsonb(s) INTO v_status, v_org, before_row FROM subscriptions s WHERE s.id = target_subscription FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Subscription not found'; END IF;
  IF v_status NOT IN ('active','suspended') THEN RAISE EXCEPTION 'Only an active or suspended subscription can be cancelled'; END IF;

  UPDATE subscriptions SET status = 'cancelled', updated_at = now() WHERE id = target_subscription;
  SELECT to_jsonb(s) INTO after_row FROM subscriptions s WHERE s.id = target_subscription;

  INSERT INTO subscription_events (subscription_id, event_type, event_summary, recorded_by)
  VALUES (target_subscription, 'cancelled', 'Subscription cancelled', auth.uid());

  UPDATE organization_commercial_profile SET subscription_status = 'canceled', updated_by = auth.uid(), updated_at = now() WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'subscription_cancelled', 'Subscription cancelled', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'subscription.cancelled', 'subscriptions', target_subscription::text, before_row, after_row, change_reason, admin_cancel_subscription.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_cancel_subscription(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_cancel_subscription(uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_cancel_subscription(uuid,text,text) FROM anon;

CREATE FUNCTION public.admin_reactivate_subscription(
  target_subscription uuid,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status subscription_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT s.status, s.organization_id, to_jsonb(s) INTO v_status, v_org, before_row FROM subscriptions s WHERE s.id = target_subscription FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Subscription not found'; END IF;
  IF v_status NOT IN ('suspended','cancelled') THEN RAISE EXCEPTION 'Only a suspended or cancelled subscription can be reactivated'; END IF;

  UPDATE subscriptions SET status = 'active', updated_at = now() WHERE id = target_subscription;
  SELECT to_jsonb(s) INTO after_row FROM subscriptions s WHERE s.id = target_subscription;

  INSERT INTO subscription_events (subscription_id, event_type, event_summary, recorded_by)
  VALUES (target_subscription, 'reactivated', 'Subscription reactivated', auth.uid());

  UPDATE organization_commercial_profile SET subscription_status = 'active', updated_by = auth.uid(), updated_at = now() WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'subscription_reactivated', 'Subscription reactivated', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'subscription.reactivated', 'subscriptions', target_subscription::text, before_row, after_row, change_reason, admin_reactivate_subscription.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_reactivate_subscription(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_reactivate_subscription(uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_reactivate_subscription(uuid,text,text) FROM anon;

CREATE FUNCTION public.admin_expire_subscription(
  target_subscription uuid,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status subscription_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT s.status, s.organization_id, to_jsonb(s) INTO v_status, v_org, before_row FROM subscriptions s WHERE s.id = target_subscription FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Subscription not found'; END IF;
  IF v_status NOT IN ('active','suspended') THEN RAISE EXCEPTION 'Only an active or suspended subscription can be marked expired'; END IF;

  UPDATE subscriptions SET status = 'expired', updated_at = now() WHERE id = target_subscription;
  SELECT to_jsonb(s) INTO after_row FROM subscriptions s WHERE s.id = target_subscription;

  INSERT INTO subscription_events (subscription_id, event_type, event_summary, recorded_by)
  VALUES (target_subscription, 'expired', 'Subscription marked expired', auth.uid());

  UPDATE organization_commercial_profile SET subscription_status = 'expired', updated_by = auth.uid(), updated_at = now() WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'subscription_expired', 'Subscription expired', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'subscription.expired', 'subscriptions', target_subscription::text, before_row, after_row, change_reason, admin_expire_subscription.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_expire_subscription(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_expire_subscription(uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_expire_subscription(uuid,text,text) FROM anon;

-- =========================================================================
-- admin_convert_trial: now creates a real subscription (signature unchanged,
-- so CREATE OR REPLACE is sufficient — grants from migration 0025 stand).
-- =========================================================================

CREATE OR REPLACE FUNCTION public.admin_convert_trial(
  target_trial uuid,
  target_plan uuid,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status trial_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; new_subscription_id uuid; v_start_date date := current_date; v_renewal_date date; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT t.status, t.organization_id, to_jsonb(t) INTO v_status, v_org, before_row FROM trials t WHERE t.id = target_trial FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Trial not found'; END IF;
  IF v_status NOT IN ('active','expired') THEN RAISE EXCEPTION 'Only an active or expired trial can be converted'; END IF;

  UPDATE trials SET status = 'converted', converted_plan_id = target_plan, converted_at = now(), updated_at = now() WHERE id = target_trial;
  SELECT to_jsonb(t) INTO after_row FROM trials t WHERE t.id = target_trial;

  INSERT INTO trial_events (trial_id, event_type, event_summary, recorded_by)
  VALUES (target_trial, 'converted', 'Trial converted to a paying subscription', auth.uid());

  v_renewal_date := (v_start_date + INTERVAL '1 month')::date;
  INSERT INTO subscriptions (organization_id, plan_id, billing_cycle, start_date, renewal_date, source_trial_id, created_by)
  VALUES (v_org, target_plan, 'monthly', v_start_date, v_renewal_date, target_trial, auth.uid())
  RETURNING id INTO new_subscription_id;

  INSERT INTO subscription_events (subscription_id, event_type, event_summary, recorded_by)
  VALUES (new_subscription_id, 'created', 'Subscription created from trial conversion', auth.uid());

  UPDATE organization_commercial_profile
    SET trial_status = 'converted', subscription_status = 'active', primary_plan_id = target_plan, renewal_date = v_renewal_date, updated_by = auth.uid(), updated_at = now()
    WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'trial_converted', 'Trial converted to a paying subscription', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'trial.converted', 'trials', target_trial::text, before_row, after_row, change_reason, admin_convert_trial.request_id);
END $$;

-- =========================================================================
-- admin_update_customer_profile trim: Subscriptions now owns
-- subscription_status/primary_plan_id/renewal_date
-- =========================================================================

DROP FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,commercial_subscription_status,uuid,date,text,text);

CREATE FUNCTION public.admin_update_customer_profile(
  target_org uuid,
  next_gst_number text,
  next_contact_person text,
  next_contact_mobile text,
  next_city text,
  next_country text,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT to_jsonb(p) INTO before_row FROM organization_commercial_profile p WHERE organization_id = target_org;

  INSERT INTO organization_commercial_profile (
    organization_id, gst_number, contact_person, contact_mobile, city, country, updated_by, updated_at
  ) VALUES (
    target_org, nullif(trim(next_gst_number),''), nullif(trim(next_contact_person),''), nullif(trim(next_contact_mobile),''),
    nullif(trim(next_city),''), nullif(trim(next_country),''), auth.uid(), now()
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    gst_number = excluded.gst_number, contact_person = excluded.contact_person, contact_mobile = excluded.contact_mobile,
    city = excluded.city, country = excluded.country, updated_by = excluded.updated_by, updated_at = now();

  SELECT to_jsonb(p) INTO after_row FROM organization_commercial_profile p WHERE organization_id = target_org;

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'customer_profile.updated', 'organization_commercial_profile', target_org::text, before_row, after_row, change_reason, admin_update_customer_profile.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,text,text) FROM anon;
