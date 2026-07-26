ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_number_uidx ON public.profiles(phone_number) WHERE phone_number IS NOT NULL;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.complete_signup_onboarding()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  signup_user auth.users%ROWTYPE;
  organization_id uuid;
  full_name text;
  phone text;
  organization_name text;
  organization_slug text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  SELECT * INTO signup_user FROM auth.users WHERE id=auth.uid();
  IF signup_user.email_confirmed_at IS NULL THEN RAISE EXCEPTION 'Email verification required' USING ERRCODE='42501'; END IF;

  SELECT membership.organization_id INTO organization_id
  FROM public.organization_members membership
  WHERE membership.user_id=auth.uid() AND membership.active=true
  ORDER BY membership.created_at LIMIT 1;
  IF organization_id IS NOT NULL THEN RETURN organization_id; END IF;

  full_name := trim(COALESCE(signup_user.raw_user_meta_data->>'display_name',''));
  phone := trim(COALESCE(signup_user.raw_user_meta_data->>'phone_number',''));
  organization_name := trim(COALESCE(signup_user.raw_user_meta_data->>'organization_name',''));
  IF length(full_name) NOT BETWEEN 2 AND 100 OR phone !~ '^\+[1-9][0-9]{7,14}$' OR length(organization_name) NOT BETWEEN 2 AND 100 THEN
    RAISE EXCEPTION 'Invalid signup metadata';
  END IF;

  INSERT INTO public.profiles(id,display_name,email,phone_number)
  VALUES(auth.uid(),full_name,lower(signup_user.email),phone)
  ON CONFLICT(id) DO UPDATE SET display_name=EXCLUDED.display_name,phone_number=EXCLUDED.phone_number,updated_at=now();

  organization_slug := trim(both '-' from regexp_replace(lower(organization_name),'[^a-z0-9]+','-','g')) || '-' || left(replace(auth.uid()::text,'-',''),8);
  INSERT INTO public.organizations(name,slug) VALUES(organization_name,organization_slug)
  ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name RETURNING id INTO organization_id;
  INSERT INTO public.organization_members(organization_id,user_id,role,active)
  VALUES(organization_id,auth.uid(),'owner',true) ON CONFLICT(organization_id,user_id) DO UPDATE SET active=true;
  INSERT INTO public.audit_logs(organization_id,actor_id,action,entity_type,entity_id,changes)
  VALUES(organization_id,auth.uid(),'create','organization',organization_id,jsonb_build_object('source','verified-signup'));
  RETURN organization_id;
END $$;
REVOKE ALL ON FUNCTION public.complete_signup_onboarding() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_signup_onboarding() TO authenticated;
