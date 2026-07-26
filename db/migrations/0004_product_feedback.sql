CREATE TYPE feedback_status AS ENUM ('new','under-review','more-information-needed','planned','in-progress','resolved','declined','duplicate');
CREATE TYPE feedback_priority AS ENUM ('unassigned','low','medium','high','critical');
CREATE TYPE platform_admin_role AS ENUM ('product-admin','security-admin','platform-admin');
CREATE TYPE feedback_run_status AS ENUM ('running','completed','failed');

CREATE TABLE platform_admins (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role platform_admin_role NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  pros text, cons text, category text NOT NULL, feature_area text, source_route text, rating smallint,
  may_contact boolean NOT NULL DEFAULT false, anonymous_to_product_team boolean NOT NULL DEFAULT false,
  status feedback_status NOT NULL DEFAULT 'new', human_priority feedback_priority NOT NULL DEFAULT 'unassigned',
  engine_suggested_priority feedback_priority NOT NULL DEFAULT 'unassigned', priority_confirmed_by uuid REFERENCES profiles(id),
  urgent_review boolean NOT NULL DEFAULT false, urgency_reason text, product_version text, user_agent_summary text,
  idempotency_key uuid NOT NULL, content_hash text NOT NULL, submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(), assigned_admin_user_id uuid REFERENCES profiles(id), soft_deleted_at timestamptz,
  CHECK (length(trim(coalesce(pros,'') || coalesce(cons,''))) >= 10), CHECK (length(pros) <= 4000), CHECK (length(cons) <= 4000), CHECK (rating BETWEEN 1 AND 5 OR rating IS NULL)
);
CREATE TABLE feedback_source_identities (
  feedback_id uuid PRIMARY KEY REFERENCES feedback_submissions(id) ON DELETE RESTRICT,
  organization_id uuid NOT NULL REFERENCES organizations(id), user_id uuid NOT NULL REFERENCES profiles(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE feedback_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), feedback_id uuid NOT NULL REFERENCES feedback_submissions(id) ON DELETE RESTRICT,
  previous_status feedback_status, new_status feedback_status NOT NULL, changed_by uuid NOT NULL REFERENCES profiles(id), change_reason text, changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE feedback_admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), feedback_id uuid NOT NULL REFERENCES feedback_submissions(id) ON DELETE RESTRICT,
  author_id uuid NOT NULL REFERENCES profiles(id), note text NOT NULL CHECK (length(trim(note)) BETWEEN 2 AND 4000), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE feedback_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), theme_key text NOT NULL, label text NOT NULL, description text,
  suggested_priority feedback_priority NOT NULL DEFAULT 'unassigned', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(theme_key)
);
CREATE TABLE feedback_theme_memberships (
  theme_id uuid NOT NULL REFERENCES feedback_themes(id) ON DELETE CASCADE, feedback_id uuid NOT NULL REFERENCES feedback_submissions(id) ON DELETE RESTRICT,
  report_id uuid, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(theme_id, feedback_id)
);
CREATE TABLE feedback_weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), period_start timestamptz NOT NULL, period_end timestamptz NOT NULL, report_version integer NOT NULL DEFAULT 1,
  generated_summary text NOT NULL, structured_metrics jsonb NOT NULL, structured_insights jsonb NOT NULL, status text NOT NULL DEFAULT 'generated',
  generated_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz, reviewed_by uuid REFERENCES profiles(id), UNIQUE(period_start, period_end, report_version)
);
ALTER TABLE feedback_theme_memberships ADD CONSTRAINT feedback_theme_memberships_report_fk FOREIGN KEY(report_id) REFERENCES feedback_weekly_reports(id) ON DELETE CASCADE;
CREATE TABLE feedback_engine_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), period_start timestamptz NOT NULL, period_end timestamptz NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz, status feedback_run_status NOT NULL DEFAULT 'running', source_count integer NOT NULL DEFAULT 0,
  output_report_id uuid REFERENCES feedback_weekly_reports(id), provider text, model text, error_details text, retry_count integer NOT NULL DEFAULT 0,
  idempotency_key text NOT NULL UNIQUE
);
CREATE TABLE feedback_admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), feedback_id uuid REFERENCES feedback_submissions(id), report_id uuid REFERENCES feedback_weekly_reports(id),
  alert_type text NOT NULL, title text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), acknowledged_at timestamptz, acknowledged_by uuid REFERENCES profiles(id)
);

CREATE INDEX feedback_submissions_org_submitted_idx ON feedback_submissions(organization_id, submitted_at DESC);
CREATE INDEX feedback_submissions_admin_queue_idx ON feedback_submissions(urgent_review, status, human_priority, submitted_at DESC) WHERE soft_deleted_at IS NULL;
CREATE UNIQUE INDEX feedback_submissions_user_idempotency_idx ON feedback_submissions(organization_id, idempotency_key);
CREATE INDEX feedback_status_history_feedback_idx ON feedback_status_history(feedback_id, changed_at DESC);
CREATE INDEX feedback_notes_feedback_idx ON feedback_admin_notes(feedback_id, created_at DESC);
CREATE INDEX feedback_reports_period_idx ON feedback_weekly_reports(period_start DESC, period_end DESC);

CREATE OR REPLACE FUNCTION public.is_platform_admin(allowed platform_admin_role[] DEFAULT ARRAY['product-admin','security-admin','platform-admin']::platform_admin_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM platform_admins WHERE user_id=auth.uid() AND active AND role=ANY(allowed)) $$;
REVOKE ALL ON FUNCTION public.is_platform_admin(platform_admin_role[]) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.is_platform_admin(platform_admin_role[]) TO authenticated;

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY; ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY; ALTER TABLE feedback_source_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_status_history ENABLE ROW LEVEL SECURITY; ALTER TABLE feedback_admin_notes ENABLE ROW LEVEL SECURITY; ALTER TABLE feedback_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_theme_memberships ENABLE ROW LEVEL SECURITY; ALTER TABLE feedback_weekly_reports ENABLE ROW LEVEL SECURITY; ALTER TABLE feedback_engine_runs ENABLE ROW LEVEL SECURITY; ALTER TABLE feedback_admin_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY platform_admin_self ON platform_admins FOR SELECT TO authenticated USING(user_id=auth.uid() AND active);
CREATE POLICY feedback_admin_read ON feedback_submissions FOR SELECT TO authenticated USING(public.is_platform_admin());
CREATE POLICY feedback_identity_security_read ON feedback_source_identities FOR SELECT TO authenticated USING(public.is_platform_admin(ARRAY['security-admin','platform-admin']::platform_admin_role[]));
CREATE POLICY feedback_history_admin_read ON feedback_status_history FOR SELECT TO authenticated USING(public.is_platform_admin());
CREATE POLICY feedback_notes_admin_read ON feedback_admin_notes FOR SELECT TO authenticated USING(public.is_platform_admin());
CREATE POLICY feedback_notes_admin_insert ON feedback_admin_notes FOR INSERT TO authenticated WITH CHECK(public.is_platform_admin() AND author_id=auth.uid());
CREATE POLICY feedback_notes_admin_update ON feedback_admin_notes FOR UPDATE TO authenticated USING(public.is_platform_admin()) WITH CHECK(public.is_platform_admin());
CREATE POLICY feedback_themes_admin_all ON feedback_themes FOR ALL TO authenticated USING(public.is_platform_admin()) WITH CHECK(public.is_platform_admin());
CREATE POLICY feedback_theme_memberships_admin_all ON feedback_theme_memberships FOR ALL TO authenticated USING(public.is_platform_admin()) WITH CHECK(public.is_platform_admin());
CREATE POLICY feedback_reports_admin_read ON feedback_weekly_reports FOR SELECT TO authenticated USING(public.is_platform_admin());
CREATE POLICY feedback_runs_admin_read ON feedback_engine_runs FOR SELECT TO authenticated USING(public.is_platform_admin());
CREATE POLICY feedback_alerts_admin_all ON feedback_admin_alerts FOR ALL TO authenticated USING(public.is_platform_admin()) WITH CHECK(public.is_platform_admin());

CREATE OR REPLACE FUNCTION public.submit_feedback(target_organization uuid, feedback_pros text, feedback_cons text, feedback_category text, feedback_feature text, feedback_route text, feedback_rating smallint, contact_allowed boolean, product_anonymous boolean, request_key uuid, urgent boolean, urgent_reason text, suggested_priority feedback_priority, product_version text, user_agent text, feedback_hash text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result_id uuid; recent_identical integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(target_organization) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  SELECT id INTO result_id FROM feedback_submissions WHERE organization_id=target_organization AND idempotency_key=request_key;
  IF result_id IS NOT NULL THEN RETURN result_id; END IF;
  IF (SELECT count(*) FROM feedback_source_identities i JOIN feedback_submissions f ON f.id=i.feedback_id WHERE i.user_id=auth.uid() AND f.submitted_at > now()-interval '1 hour') >= 10 THEN RAISE EXCEPTION 'Rate limit exceeded' USING ERRCODE='P0001'; END IF;
  IF (SELECT count(*) FROM feedback_submissions f WHERE f.organization_id=target_organization AND f.submitted_at > now()-interval '1 hour') >= 50 THEN RAISE EXCEPTION 'Organization rate limit exceeded' USING ERRCODE='P0001'; END IF;
  SELECT count(*) INTO recent_identical FROM feedback_source_identities i JOIN feedback_submissions f ON f.id=i.feedback_id WHERE i.user_id=auth.uid() AND f.content_hash=feedback_hash AND f.submitted_at > now()-interval '24 hours';
  IF recent_identical > 0 THEN RAISE EXCEPTION 'Duplicate feedback' USING ERRCODE='P0001'; END IF;
  INSERT INTO feedback_submissions(organization_id,pros,cons,category,feature_area,source_route,rating,may_contact,anonymous_to_product_team,idempotency_key,urgent_review,urgency_reason,engine_suggested_priority,product_version,user_agent_summary,content_hash)
  VALUES(target_organization,nullif(trim(feedback_pros),''),nullif(trim(feedback_cons),''),feedback_category,nullif(trim(feedback_feature),''),feedback_route,feedback_rating,contact_allowed,product_anonymous,request_key,urgent,urgent_reason,suggested_priority,product_version,left(user_agent,300),feedback_hash) RETURNING id INTO result_id;
  INSERT INTO feedback_source_identities(feedback_id,organization_id,user_id) VALUES(result_id,target_organization,auth.uid());
  INSERT INTO feedback_status_history(feedback_id,new_status,changed_by,change_reason) VALUES(result_id,'new',auth.uid(),'Feedback submitted');
  IF NOT urgent AND (SELECT count(DISTINCT organization_id) FROM feedback_submissions WHERE content_hash=feedback_hash AND submitted_at>now()-interval '7 days') >= 2 THEN
    urgent:=true;
    UPDATE feedback_submissions SET urgent_review=true, urgency_reason='Repeated matching reports across organizations', engine_suggested_priority='high' WHERE id=result_id;
  END IF;
  IF urgent THEN INSERT INTO feedback_admin_alerts(feedback_id,alert_type,title) VALUES(result_id,'urgent-feedback','Urgent product feedback requires review'); END IF;
  RETURN result_id;
END $$;
REVOKE ALL ON FUNCTION public.submit_feedback(uuid,text,text,text,text,text,smallint,boolean,boolean,uuid,boolean,text,feedback_priority,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_feedback(uuid,text,text,text,text,text,smallint,boolean,boolean,uuid,boolean,text,feedback_priority,text,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_feedback(target_feedback uuid, next_status feedback_status, next_priority feedback_priority, reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE old_status feedback_status; BEGIN
 IF NOT public.is_platform_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT status INTO old_status FROM feedback_submissions WHERE id=target_feedback FOR UPDATE;
 UPDATE feedback_submissions SET status=next_status, human_priority=next_priority, priority_confirmed_by=CASE WHEN next_priority='unassigned' THEN NULL ELSE auth.uid() END, updated_at=now() WHERE id=target_feedback;
 IF old_status IS DISTINCT FROM next_status THEN INSERT INTO feedback_status_history(feedback_id,previous_status,new_status,changed_by,change_reason) VALUES(target_feedback,old_status,next_status,auth.uid(),left(reason,1000)); END IF;
END $$;
REVOKE ALL ON FUNCTION public.admin_update_feedback(uuid,feedback_status,feedback_priority,text) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.admin_update_feedback(uuid,feedback_status,feedback_priority,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.admin_assign_feedback(target_feedback uuid, target_admin uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.is_platform_admin() OR NOT EXISTS(SELECT 1 FROM platform_admins WHERE user_id=target_admin AND active) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 UPDATE feedback_submissions SET assigned_admin_user_id=target_admin,updated_at=now() WHERE id=target_feedback;
END $$;
REVOKE ALL ON FUNCTION public.admin_assign_feedback(uuid,uuid) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.admin_assign_feedback(uuid,uuid) TO authenticated;
