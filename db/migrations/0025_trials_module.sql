-- Oxiom Control Center — Phase 2b, Checkpoint 1 (Trials)
--
-- Lifecycle: requested -> under_review -> (rejected | active) -> (expired | converted)
--
--   Trial Requested
--         |
--         v
--   Under Review ──────► Rejected
--         |
--         v
--   Approved ──► Trial Active ──► Extended
--                     |     ──► Expired
--                     v
--                Converted ──► Customer + Subscription Created
--
-- Every trial starts as a logged request — there is no database-backed
-- request queue upstream of this yet (app/trial/page.tsx opens a mailto:
-- to sales today). "Approved" and "Extended" are transitions/events rather
-- than resting states: approving activates in the same step (no product
-- need yet for a gap between the two), and extending an active trial keeps
-- it 'active' with a later end date and a bumped extension_count.
--
-- organization_commercial_profile.trial_status/trial_started_at/trial_ends_at
-- remain the Customer Directory's headline cache, kept in sync exclusively
-- by the RPCs below rather than hand-edited on the Customer Profile form —
-- the same headline-vs-source-of-truth split already used for
-- primary_plan_id (migration 0024). admin_update_customer_profile is
-- trimmed at the bottom of this file to match.

CREATE TYPE trial_lifecycle_status AS ENUM ('requested','under_review','active','expired','converted','rejected');

CREATE TABLE trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES platform_products(id),
  status trial_lifecycle_status NOT NULL DEFAULT 'requested',
  contact_person text,
  contact_email text,
  contact_mobile text,
  started_at timestamptz,
  ends_at timestamptz,
  extension_count integer NOT NULL DEFAULT 0,
  converted_plan_id uuid REFERENCES commercial_plans(id),
  converted_at timestamptz,
  rejected_reason text,
  rejected_at timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX trials_org_idx ON trials(organization_id, created_at DESC);
CREATE INDEX trials_status_idx ON trials(status);

CREATE TABLE trial_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id uuid NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_summary text NOT NULL,
  metadata jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES profiles(id)
);
CREATE INDEX trial_events_trial_idx ON trial_events(trial_id, occurred_at DESC);

CREATE TABLE trial_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id uuid NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  note text NOT NULL CHECK (length(trim(note)) BETWEEN 2 AND 4000),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX trial_notes_trial_idx ON trial_notes(trial_id, created_at DESC);

-- =========================================================================
-- Row Level Security
-- =========================================================================

ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_notes ENABLE ROW LEVEL SECURITY;

-- trials: Owner read-only. Every write goes through a SECURITY DEFINER RPC
-- below, so a trial's status transitions are always validated server-side.
CREATE POLICY trials_owner_read ON trials
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

-- trial_events: Owner read-only; RPC-only writes, same as customer_timeline_events.
CREATE POLICY trial_events_owner_read ON trial_events
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));

-- trial_notes: Owner read + insert-as-self, same as customer_notes. Append-only.
CREATE POLICY trial_notes_owner_read ON trial_notes
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]));
CREATE POLICY trial_notes_owner_insert ON trial_notes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) AND created_by = auth.uid());

-- =========================================================================
-- RPCs
-- =========================================================================

-- Logs an inbound trial request. Every trial starts here.
CREATE FUNCTION public.admin_request_trial(
  target_org uuid,
  target_product uuid,
  contact_person text,
  contact_email text,
  contact_mobile text,
  request_id text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE new_trial_id uuid; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  INSERT INTO trials (organization_id, product_id, status, contact_person, contact_email, contact_mobile, created_by)
  VALUES (target_org, target_product, 'requested', nullif(trim(contact_person),''), nullif(trim(contact_email),''), nullif(trim(contact_mobile),''), auth.uid())
  RETURNING id INTO new_trial_id;
  SELECT to_jsonb(t) INTO after_row FROM trials t WHERE t.id = new_trial_id;

  INSERT INTO trial_events (trial_id, event_type, event_summary, recorded_by)
  VALUES (new_trial_id, 'requested', 'Trial requested', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'trial.requested', 'trials', new_trial_id::text, NULL, after_row, NULL, admin_request_trial.request_id);

  RETURN new_trial_id;
END $$;
REVOKE ALL ON FUNCTION public.admin_request_trial(uuid,uuid,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_request_trial(uuid,uuid,text,text,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_request_trial(uuid,uuid,text,text,text,text) FROM anon;

-- Marks a requested trial as being looked at. Optional waypoint — Approve
-- and Reject both work directly from 'requested' too, so this never blocks
-- a decision the Owner is ready to make immediately.
CREATE FUNCTION public.admin_set_trial_under_review(
  target_trial uuid,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status trial_lifecycle_status; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT t.status, to_jsonb(t) INTO v_status, before_row FROM trials t WHERE t.id = target_trial FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Trial not found'; END IF;
  IF v_status <> 'requested' THEN RAISE EXCEPTION 'Only a requested trial can be marked under review'; END IF;

  UPDATE trials SET status = 'under_review', updated_at = now() WHERE id = target_trial;
  SELECT to_jsonb(t) INTO after_row FROM trials t WHERE t.id = target_trial;

  INSERT INTO trial_events (trial_id, event_type, event_summary, recorded_by)
  VALUES (target_trial, 'under_review', 'Trial marked under review', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, request_id)
  VALUES (auth.uid(), 'trial.under_review', 'trials', target_trial::text, before_row, after_row, admin_set_trial_under_review.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_set_trial_under_review(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_trial_under_review(uuid,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_set_trial_under_review(uuid,text) FROM anon;

-- Approves a requested/under-review trial and activates it in the same
-- step. duration_days defaults to 7 to match the "free 7-day trial"
-- offered on the public trial request page.
CREATE FUNCTION public.admin_approve_trial(
  target_trial uuid,
  duration_days integer DEFAULT 7,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status trial_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; v_started_at timestamptz := now(); v_ends_at timestamptz; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  IF duration_days IS NULL OR duration_days <= 0 THEN RAISE EXCEPTION 'duration_days must be positive'; END IF;

  SELECT t.status, t.organization_id, to_jsonb(t) INTO v_status, v_org, before_row FROM trials t WHERE t.id = target_trial FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Trial not found'; END IF;
  IF v_status NOT IN ('requested','under_review') THEN RAISE EXCEPTION 'Only a requested or under-review trial can be approved'; END IF;

  v_ends_at := v_started_at + (duration_days || ' days')::interval;

  UPDATE trials SET status = 'active', started_at = v_started_at, ends_at = v_ends_at, updated_at = now() WHERE id = target_trial;
  SELECT to_jsonb(t) INTO after_row FROM trials t WHERE t.id = target_trial;

  INSERT INTO trial_events (trial_id, event_type, event_summary, recorded_by)
  VALUES (target_trial, 'approved', format('Trial approved, %s days, ends %s', duration_days, to_char(v_ends_at, 'YYYY-MM-DD')), auth.uid());

  INSERT INTO organization_commercial_profile (organization_id, trial_status, trial_started_at, trial_ends_at, updated_by, updated_at)
  VALUES (v_org, 'active', v_started_at, v_ends_at, auth.uid(), now())
  ON CONFLICT (organization_id) DO UPDATE SET
    trial_status = 'active', trial_started_at = excluded.trial_started_at, trial_ends_at = excluded.trial_ends_at,
    updated_by = excluded.updated_by, updated_at = now();

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'trial_started', 'Trial approved and started', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'trial.approved', 'trials', target_trial::text, before_row, after_row, change_reason, admin_approve_trial.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_approve_trial(uuid,integer,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_approve_trial(uuid,integer,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_approve_trial(uuid,integer,text,text) FROM anon;

-- Declines a requested/under-review trial. It never goes active, so
-- organization_commercial_profile is left untouched.
CREATE FUNCTION public.admin_reject_trial(
  target_trial uuid,
  rejected_reason text,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status trial_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  IF nullif(trim(rejected_reason),'') IS NULL THEN RAISE EXCEPTION 'A rejection reason is required'; END IF;

  SELECT t.status, t.organization_id, to_jsonb(t) INTO v_status, v_org, before_row FROM trials t WHERE t.id = target_trial FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Trial not found'; END IF;
  IF v_status NOT IN ('requested','under_review') THEN RAISE EXCEPTION 'Only a requested or under-review trial can be rejected'; END IF;

  UPDATE trials SET status = 'rejected', rejected_reason = trim(admin_reject_trial.rejected_reason), rejected_at = now(), updated_at = now() WHERE id = target_trial;
  SELECT to_jsonb(t) INTO after_row FROM trials t WHERE t.id = target_trial;

  INSERT INTO trial_events (trial_id, event_type, event_summary, recorded_by)
  VALUES (target_trial, 'rejected', format('Trial request rejected: %s', trim(admin_reject_trial.rejected_reason)), auth.uid());

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'trial_rejected', 'Trial request rejected', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'trial.rejected', 'trials', target_trial::text, before_row, after_row, trim(admin_reject_trial.rejected_reason), admin_reject_trial.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_reject_trial(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_reject_trial(uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_reject_trial(uuid,text,text) FROM anon;

-- Pushes an active trial's end date out and records the extension. Only
-- valid on a trial currently 'active' — an expired/converted/rejected trial
-- is a closed outcome, not something to reopen by extending it.
CREATE FUNCTION public.admin_extend_trial(
  target_trial uuid,
  new_ends_at timestamptz,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status trial_lifecycle_status; v_org uuid; v_old_ends timestamptz; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT t.status, t.organization_id, t.ends_at, to_jsonb(t) INTO v_status, v_org, v_old_ends, before_row
  FROM trials t WHERE t.id = target_trial FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Trial not found'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Only an active trial can be extended'; END IF;
  IF new_ends_at <= v_old_ends THEN RAISE EXCEPTION 'New end date must be after the current end date'; END IF;

  UPDATE trials SET ends_at = new_ends_at, extension_count = extension_count + 1, updated_at = now() WHERE id = target_trial;
  SELECT to_jsonb(t) INTO after_row FROM trials t WHERE t.id = target_trial;

  INSERT INTO trial_events (trial_id, event_type, event_summary, recorded_by)
  VALUES (target_trial, 'extended', format('Trial extended to %s', to_char(new_ends_at, 'YYYY-MM-DD')), auth.uid());

  UPDATE organization_commercial_profile SET trial_ends_at = new_ends_at, updated_by = auth.uid(), updated_at = now() WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'trial_extended', format('Trial extended to %s', to_char(new_ends_at, 'YYYY-MM-DD')), auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'trial.extended', 'trials', target_trial::text, before_row, after_row, change_reason, admin_extend_trial.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_extend_trial(uuid,timestamptz,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_extend_trial(uuid,timestamptz,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_extend_trial(uuid,timestamptz,text,text) FROM anon;

-- Manually marks a trial expired. There is no background scheduler in this
-- codebase, so expiry is an explicit Owner action, not a computed cron
-- transition — the Dashboard's "trial ending soon / has ended" notification
-- (lib/control-center/notification-rules.ts) already flags trials whose
-- ends_at has passed so the Owner knows to come here.
CREATE FUNCTION public.admin_expire_trial(
  target_trial uuid,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status trial_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT t.status, t.organization_id, to_jsonb(t) INTO v_status, v_org, before_row FROM trials t WHERE t.id = target_trial FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Trial not found'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Only an active trial can be marked expired'; END IF;

  UPDATE trials SET status = 'expired', updated_at = now() WHERE id = target_trial;
  SELECT to_jsonb(t) INTO after_row FROM trials t WHERE t.id = target_trial;

  INSERT INTO trial_events (trial_id, event_type, event_summary, recorded_by)
  VALUES (target_trial, 'expired', 'Trial marked expired', auth.uid());

  UPDATE organization_commercial_profile SET trial_status = 'expired', updated_by = auth.uid(), updated_at = now() WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'trial_expired', 'Trial expired', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'trial.expired', 'trials', target_trial::text, before_row, after_row, change_reason, admin_expire_trial.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_expire_trial(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_expire_trial(uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_expire_trial(uuid,text,text) FROM anon;

-- Converts a trial into a paying customer against a chosen commercial plan
-- — "Customer + Subscription Created." Sets the org's headline subscription
-- state directly, the same interim representation primary_plan_id already
-- stands in for — there is no real Subscriptions entity until Phase 2b
-- Checkpoint 2. Allowed from 'active' or 'expired' (a customer can convert
-- after their trial lapsed but before anyone got around to marking it
-- expired); 'rejected' and already 'converted' trials are terminal.
CREATE FUNCTION public.admin_convert_trial(
  target_trial uuid,
  target_plan uuid,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_status trial_lifecycle_status; v_org uuid; before_row jsonb; after_row jsonb; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT t.status, t.organization_id, to_jsonb(t) INTO v_status, v_org, before_row FROM trials t WHERE t.id = target_trial FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Trial not found'; END IF;
  IF v_status NOT IN ('active','expired') THEN RAISE EXCEPTION 'Only an active or expired trial can be converted'; END IF;

  UPDATE trials SET status = 'converted', converted_plan_id = target_plan, converted_at = now(), updated_at = now() WHERE id = target_trial;
  SELECT to_jsonb(t) INTO after_row FROM trials t WHERE t.id = target_trial;

  INSERT INTO trial_events (trial_id, event_type, event_summary, recorded_by)
  VALUES (target_trial, 'converted', 'Trial converted to a paying subscription', auth.uid());

  UPDATE organization_commercial_profile
    SET trial_status = 'converted', subscription_status = 'active', primary_plan_id = target_plan, updated_by = auth.uid(), updated_at = now()
    WHERE organization_id = v_org;

  INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
  VALUES (v_org, 'trial_converted', 'Trial converted to a paying subscription', auth.uid());

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'trial.converted', 'trials', target_trial::text, before_row, after_row, change_reason, admin_convert_trial.request_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_convert_trial(uuid,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_convert_trial(uuid,uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_convert_trial(uuid,uuid,text,text) FROM anon;

-- =========================================================================
-- admin_update_customer_profile trim: Trials now owns trial_status/dates
-- =========================================================================

DROP FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,commercial_trial_status,timestamptz,timestamptz,commercial_subscription_status,uuid,date,text,text);

CREATE FUNCTION public.admin_update_customer_profile(
  target_org uuid,
  next_gst_number text,
  next_contact_person text,
  next_contact_mobile text,
  next_city text,
  next_country text,
  next_subscription_status commercial_subscription_status,
  next_primary_plan_id uuid,
  next_renewal_date date,
  change_reason text DEFAULT NULL,
  request_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE before_row jsonb; after_row jsonb; prev_subscription commercial_subscription_status; BEGIN
  IF NOT public.is_platform_admin(ARRAY['platform-admin']::platform_admin_role[]) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;

  SELECT to_jsonb(p), p.subscription_status
    INTO before_row, prev_subscription
  FROM organization_commercial_profile p WHERE organization_id = target_org;

  INSERT INTO organization_commercial_profile (
    organization_id, gst_number, contact_person, contact_mobile, city, country,
    subscription_status, primary_plan_id, renewal_date,
    updated_by, updated_at
  ) VALUES (
    target_org, nullif(trim(next_gst_number),''), nullif(trim(next_contact_person),''), nullif(trim(next_contact_mobile),''),
    nullif(trim(next_city),''), nullif(trim(next_country),''),
    next_subscription_status, next_primary_plan_id, next_renewal_date, auth.uid(), now()
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    gst_number = excluded.gst_number, contact_person = excluded.contact_person, contact_mobile = excluded.contact_mobile,
    city = excluded.city, country = excluded.country,
    subscription_status = excluded.subscription_status, primary_plan_id = excluded.primary_plan_id,
    renewal_date = excluded.renewal_date, updated_by = excluded.updated_by, updated_at = now();

  SELECT to_jsonb(p) INTO after_row FROM organization_commercial_profile p WHERE organization_id = target_org;

  INSERT INTO commercial_audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, reason, request_id)
  VALUES (auth.uid(), 'customer_profile.updated', 'organization_commercial_profile', target_org::text, before_row, after_row, change_reason, admin_update_customer_profile.request_id);

  IF prev_subscription IS DISTINCT FROM next_subscription_status THEN
    INSERT INTO customer_timeline_events (organization_id, event_type, event_summary, recorded_by)
    VALUES (target_org, 'subscription_status_changed', format('Subscription status changed from %s to %s', coalesce(prev_subscription::text, 'none'), next_subscription_status::text), auth.uid());
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,commercial_subscription_status,uuid,date,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,commercial_subscription_status,uuid,date,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_customer_profile(uuid,text,text,text,text,text,commercial_subscription_status,uuid,date,text,text) FROM anon;
