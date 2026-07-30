-- Oxiom Control Center — Phase 2a, architectural refinement requested after
-- Checkpoint 4: current_plan_id renamed to primary_plan_id.
--
-- "Current" implied a single, exclusive plan per organization. Once the
-- Subscriptions module owns a real one-to-many organization-to-plan
-- relationship, an organization can hold several concurrent plans across
-- products — this column is only ever the headline/primary one shown on
-- the Customer Directory, not the source of truth for what an
-- organization is actually subscribed to. Renamed end-to-end (column, RPC
-- parameter) rather than just the column, so the same confusion doesn't
-- resurface at the RPC boundary.

ALTER TABLE organization_commercial_profile RENAME COLUMN current_plan_id TO primary_plan_id;

-- Renaming an IN parameter is not something CREATE OR REPLACE allows
-- (Postgres error 42P13) — the function must be dropped first. That resets
-- grants to the project's schema defaults, so the anon revoke at the
-- bottom of this file is not optional cleanup, it's required again.
DROP FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,commercial_trial_status,timestamptz,timestamptz,commercial_subscription_status,uuid,date,text,text);

CREATE FUNCTION public.admin_update_customer_profile(
  target_org uuid,
  next_gst_number text,
  next_contact_person text,
  next_contact_mobile text,
  next_city text,
  next_country text,
  next_trial_status commercial_trial_status,
  next_trial_started_at timestamptz,
  next_trial_ends_at timestamptz,
  next_subscription_status commercial_subscription_status,
  next_primary_plan_id uuid,
  next_renewal_date date,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE before_row jsonb; after_row jsonb; prev_trial commercial_trial_status; prev_subscription commercial_subscription_status; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT to_jsonb(p), p.trial_status, p.subscription_status
    INTO before_row, prev_trial, prev_subscription
  FROM organization_commercial_profile p WHERE organization_id = target_org;

  INSERT INTO organization_commercial_profile (
    organization_id, gst_number, contact_person, contact_mobile, city, country,
    trial_status, trial_started_at, trial_ends_at, subscription_status, primary_plan_id, renewal_date,
    updated_by, updated_at
  ) VALUES (
    target_org, nullif(trim(next_gst_number),''), nullif(trim(next_contact_person),''), nullif(trim(next_contact_mobile),''),
    nullif(trim(next_city),''), nullif(trim(next_country),''), next_trial_status, next_trial_started_at, next_trial_ends_at,
    next_subscription_status, next_primary_plan_id, next_renewal_date, auth.uid(), now()
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    gst_number = excluded.gst_number, contact_person = excluded.contact_person, contact_mobile = excluded.contact_mobile,
    city = excluded.city, country = excluded.country, trial_status = excluded.trial_status,
    trial_started_at = excluded.trial_started_at, trial_ends_at = excluded.trial_ends_at,
    subscription_status = excluded.subscription_status, primary_plan_id = excluded.primary_plan_id,
    renewal_date = excluded.renewal_date, updated_by = excluded.updated_by, updated_at = now();

  SELECT to_jsonb(p) INTO after_row FROM organization_commercial_profile p WHERE organization_id = target_org;

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'customer_profile.updated', 'organization_commercial_profile', target_org::text, before_row, after_row, change_reason, admin_update_customer_profile.request_id);

  IF prev_trial IS DISTINCT FROM next_trial_status THEN
    INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
    VALUES (target_org, 'trial_status_changed', format('Trial status changed from %s to %s', coalesce(prev_trial::text, 'none'), next_trial_status::text), auth.uid());
  END IF;
  IF prev_subscription IS DISTINCT FROM next_subscription_status THEN
    INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
    VALUES (target_org, 'subscription_status_changed', format('Subscription status changed from %s to %s', coalesce(prev_subscription::text, 'none'), next_subscription_status::text), auth.uid());
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,commercial_trial_status,timestamptz,timestamptz,commercial_subscription_status,uuid,date,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,commercial_trial_status,timestamptz,timestamptz,commercial_subscription_status,uuid,date,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,commercial_trial_status,timestamptz,timestamptz,commercial_subscription_status,uuid,date,text,text) FROM anon;
