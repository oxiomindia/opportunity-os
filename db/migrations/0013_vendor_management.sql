-- Version 1: Accounts Payable module, built alongside AR. The "vendors"
-- table, its RLS, and the invoices.vendor_id FK have existed since
-- 0000_dusty_shadowcat.sql but were never wired up to any application
-- code -- this adds the two columns real vendor management needs and the
-- CRUD RPCs, mirroring create_customer/update_customer exactly.
ALTER TABLE vendors ADD COLUMN "phone" text;
ALTER TABLE vendors ADD COLUMN "address" text;

CREATE OR REPLACE FUNCTION public.create_vendor(
  target_organization uuid, vendor_name text, vendor_email text,
  vendor_phone text, vendor_address text, vendor_tax_identifier text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(target_organization) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF length(trim(vendor_name)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Invalid vendor name' USING ERRCODE = '22023';
  END IF;
  INSERT INTO vendors (organization_id, name, normalized_name, email, phone, address, tax_identifier)
  VALUES (
    target_organization, trim(vendor_name), lower(trim(vendor_name)),
    nullif(trim(vendor_email), ''), nullif(trim(vendor_phone), ''),
    nullif(trim(vendor_address), ''), nullif(trim(vendor_tax_identifier), '')
  )
  RETURNING id INTO result_id;
  RETURN result_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_vendor(uuid, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_vendor(uuid, text, text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_vendor(
  target_vendor uuid, vendor_name text, vendor_email text,
  vendor_phone text, vendor_address text, vendor_tax_identifier text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid;
BEGIN
  SELECT organization_id INTO target_org FROM vendors WHERE id = target_vendor FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF length(trim(vendor_name)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Invalid vendor name' USING ERRCODE = '22023';
  END IF;
  UPDATE vendors SET
    name = trim(vendor_name),
    normalized_name = lower(trim(vendor_name)),
    email = nullif(trim(vendor_email), ''),
    phone = nullif(trim(vendor_phone), ''),
    address = nullif(trim(vendor_address), ''),
    tax_identifier = nullif(trim(vendor_tax_identifier), ''),
    updated_at = now()
  WHERE id = target_vendor;
END;
$$;
REVOKE ALL ON FUNCTION public.update_vendor(uuid, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_vendor(uuid, text, text, text, text, text) TO authenticated;
