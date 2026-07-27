-- Auth signup is a single database transaction. The legacy on_auth_user_created trigger
-- inserted only a profile and could abort that transaction when its schema drifted,
-- which Supabase reports as "Database error saving new user". Replace it with one
-- idempotent bootstrap that creates every row required by the first workspace owner.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.bootstrap_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  full_name text;
  phone text;
  organization_name text;
  organization_slug text;
  organization_id uuid;
BEGIN
  full_name := trim(COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  phone := trim(COALESCE(NEW.raw_user_meta_data->>'phone_number', ''));
  organization_name := trim(COALESCE(NEW.raw_user_meta_data->>'organization_name', ''));

  IF length(full_name) NOT BETWEEN 2 AND 100 THEN
    RAISE EXCEPTION 'Invalid signup display name' USING ERRCODE = '22023';
  END IF;
  IF phone !~ '^\+[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION 'Invalid signup phone number' USING ERRCODE = '22023';
  END IF;
  IF length(organization_name) NOT BETWEEN 2 AND 100 THEN
    RAISE EXCEPTION 'Invalid signup organization name' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.profiles (id, display_name, email, phone_number)
  VALUES (NEW.id, full_name, lower(NEW.email), phone)
  ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        phone_number = EXCLUDED.phone_number,
        updated_at = now();

  organization_slug := trim(both '-' from regexp_replace(lower(organization_name), '[^a-z0-9]+', '-', 'g'))
    || '-' || left(replace(NEW.id::text, '-', ''), 8);
  INSERT INTO public.organizations (name, slug)
  VALUES (organization_name, organization_slug)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO organization_id;

  INSERT INTO public.organization_members (organization_id, user_id, role, active)
  VALUES (organization_id, NEW.id, 'owner', true)
  ON CONFLICT (organization_id, user_id) DO UPDATE
    SET role = 'owner', active = true;

  INSERT INTO public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, changes)
  VALUES (organization_id, NEW.id, 'create', 'organization', organization_id,
    jsonb_build_object('source', 'signup-bootstrap'));

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_new_auth_user() FROM PUBLIC;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_new_auth_user();
