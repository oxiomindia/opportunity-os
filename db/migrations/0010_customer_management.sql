-- Version 1 pivot: Oxiom bills customers directly (Accounts Receivable), rather
-- than only processing vendor invoices. This adds the customer directory this
-- flow needs. invoices.customer_id is added separately once invoice creation
-- is wired to bill a customer.
CREATE TABLE "customers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "normalized_name" text NOT NULL,
  "email" text,
  "phone" text,
  "billing_address" text,
  "tax_identifier" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "customers_org_normalized_name_uidx" ON "customers" USING btree ("organization_id","normalized_name");
CREATE INDEX "customers_org_idx" ON "customers" USING btree ("organization_id");

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_customers" ON customers FOR ALL TO authenticated
  USING (public.is_organization_member(organization_id))
  WITH CHECK (public.is_organization_member(organization_id));

CREATE OR REPLACE FUNCTION public.create_customer(
  target_organization uuid, customer_name text, customer_email text,
  customer_phone text, customer_billing_address text, customer_tax_identifier text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(target_organization) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF length(trim(customer_name)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Invalid customer name' USING ERRCODE = '22023';
  END IF;
  INSERT INTO customers (organization_id, name, normalized_name, email, phone, billing_address, tax_identifier)
  VALUES (
    target_organization, trim(customer_name), lower(trim(customer_name)),
    nullif(trim(customer_email), ''), nullif(trim(customer_phone), ''),
    nullif(trim(customer_billing_address), ''), nullif(trim(customer_tax_identifier), '')
  )
  RETURNING id INTO result_id;
  RETURN result_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_customer(uuid, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_customer(uuid, text, text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_customer(
  target_customer uuid, customer_name text, customer_email text,
  customer_phone text, customer_billing_address text, customer_tax_identifier text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid;
BEGIN
  SELECT organization_id INTO target_org FROM customers WHERE id = target_customer FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF length(trim(customer_name)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Invalid customer name' USING ERRCODE = '22023';
  END IF;
  UPDATE customers SET
    name = trim(customer_name),
    normalized_name = lower(trim(customer_name)),
    email = nullif(trim(customer_email), ''),
    phone = nullif(trim(customer_phone), ''),
    billing_address = nullif(trim(customer_billing_address), ''),
    tax_identifier = nullif(trim(customer_tax_identifier), ''),
    updated_at = now()
  WHERE id = target_customer;
END;
$$;
REVOKE ALL ON FUNCTION public.update_customer(uuid, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_customer(uuid, text, text, text, text, text) TO authenticated;
