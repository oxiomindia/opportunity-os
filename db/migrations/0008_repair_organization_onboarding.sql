-- A verified Auth user can reach /onboarding without a profile when migration 0006
-- (which removed the legacy profile trigger) is present but the later bootstrap
-- trigger did not run for that user. The organization_members FK then makes the
-- legacy create_organization function roll back its organization insert. Repair
-- the profile inside the same idempotent, security-definer transaction before
-- creating the organization and Owner membership.
CREATE OR REPLACE FUNCTION public.create_organization(organization_name text, organization_slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  signup_user auth.users%ROWTYPE;
  created_organization_id uuid;
  existing_organization_id uuid;
  display_name text;
  phone text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF length(trim(organization_name)) NOT BETWEEN 2 AND 100 THEN
    RAISE EXCEPTION 'Invalid organization name' USING ERRCODE = '22023';
  END IF;
  IF organization_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Invalid organization slug' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO signup_user FROM auth.users WHERE id = auth.uid();
  IF signup_user.id IS NULL THEN
    RAISE EXCEPTION 'Authenticated user record not found' USING ERRCODE = 'P0002';
  END IF;
  IF signup_user.email_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Email verification required' USING ERRCODE = '42501';
  END IF;

  SELECT membership.organization_id INTO existing_organization_id
  FROM public.organization_members membership
  WHERE membership.user_id = auth.uid() AND membership.active = true
  ORDER BY membership.created_at
  LIMIT 1;
  IF existing_organization_id IS NOT NULL THEN
    RETURN existing_organization_id;
  END IF;

  display_name := trim(COALESCE(signup_user.raw_user_meta_data->>'display_name', ''));
  IF length(display_name) NOT BETWEEN 2 AND 100 THEN
    display_name := split_part(signup_user.email, '@', 1);
  END IF;
  phone := NULLIF(trim(COALESCE(signup_user.raw_user_meta_data->>'phone_number', '')), '');

  INSERT INTO public.profiles (id, display_name, email, phone_number)
  VALUES (signup_user.id, display_name, lower(signup_user.email), phone)
  ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
        updated_at = now();

  INSERT INTO public.organizations (name, slug)
  VALUES (trim(organization_name), organization_slug)
  RETURNING id INTO created_organization_id;

  INSERT INTO public.organization_members (organization_id, user_id, role, active)
  VALUES (created_organization_id, signup_user.id, 'owner', true);

  INSERT INTO public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, changes)
  VALUES (created_organization_id, signup_user.id, 'create', 'organization', created_organization_id,
    jsonb_build_object('source', 'manual-onboarding', 'profile_repaired', true));

  RETURN created_organization_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization(text, text) TO authenticated;
