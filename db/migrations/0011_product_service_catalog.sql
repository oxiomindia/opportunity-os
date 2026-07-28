-- Version 1 AR pivot, continued: a catalog of products/services an
-- organization bills customers for. invoice_items.product_id is added
-- separately once invoice creation is wired to the AR flow.
CREATE TABLE "products_services" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "sku" text,
  "unit_price" numeric(18, 2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "products_services_org_idx" ON "products_services" USING btree ("organization_id");
CREATE UNIQUE INDEX "products_services_org_sku_uidx" ON "products_services" USING btree ("organization_id","sku") WHERE "sku" IS NOT NULL;

ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_products_services" ON products_services FOR ALL TO authenticated
  USING (public.is_organization_member(organization_id))
  WITH CHECK (public.is_organization_member(organization_id));

CREATE OR REPLACE FUNCTION public.create_product_service(
  target_organization uuid, item_name text, item_description text,
  item_sku text, item_unit_price numeric, item_currency text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(target_organization) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF length(trim(item_name)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Invalid item name' USING ERRCODE = '22023';
  END IF;
  IF item_unit_price < 0 THEN
    RAISE EXCEPTION 'Unit price must not be negative' USING ERRCODE = '22023';
  END IF;
  IF item_currency NOT IN ('USD', 'EUR', 'INR') THEN
    RAISE EXCEPTION 'Unsupported currency' USING ERRCODE = '22023';
  END IF;
  INSERT INTO products_services (organization_id, name, description, sku, unit_price, currency)
  VALUES (
    target_organization, trim(item_name), nullif(trim(item_description), ''),
    nullif(trim(item_sku), ''), item_unit_price, item_currency
  )
  RETURNING id INTO result_id;
  RETURN result_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_product_service(uuid, text, text, text, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_product_service(uuid, text, text, text, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_product_service(
  target_item uuid, item_name text, item_description text,
  item_sku text, item_unit_price numeric, item_currency text, item_active boolean
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid;
BEGIN
  SELECT organization_id INTO target_org FROM products_services WHERE id = target_item FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF length(trim(item_name)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Invalid item name' USING ERRCODE = '22023';
  END IF;
  IF item_unit_price < 0 THEN
    RAISE EXCEPTION 'Unit price must not be negative' USING ERRCODE = '22023';
  END IF;
  IF item_currency NOT IN ('USD', 'EUR', 'INR') THEN
    RAISE EXCEPTION 'Unsupported currency' USING ERRCODE = '22023';
  END IF;
  UPDATE products_services SET
    name = trim(item_name),
    description = nullif(trim(item_description), ''),
    sku = nullif(trim(item_sku), ''),
    unit_price = item_unit_price,
    currency = item_currency,
    active = item_active,
    updated_at = now()
  WHERE id = target_item;
END;
$$;
REVOKE ALL ON FUNCTION public.update_product_service(uuid, text, text, text, numeric, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_product_service(uuid, text, text, text, numeric, text, boolean) TO authenticated;
