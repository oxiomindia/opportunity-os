-- Input Tax Credit Recovery & Reconciliation, Checkpoint 2 (Database & Backend).
--
-- One new table: itc_return_records. It holds the filed-return side of a
-- reconciliation (manually entered or CSV-imported GSTR figures); the
-- purchase side is the existing vendor_invoices/vendors tables, reused
-- as-is with no schema change. Reconciliation itself is computed at read
-- time in application code (lib/itcRecovery/), not stored here -- there is
-- no "match" table, so nothing needs to be kept in sync.
--
-- Tenant isolation, RLS shape, and the create/delete RPC pattern mirror
-- vendor_invoices (migration 0014) exactly: reads via a SELECT policy,
-- writes via SECURITY DEFINER RPCs that re-check organization membership,
-- soft delete via deleted_at rather than a hard DELETE, and an audit_logs
-- entry on every write.

CREATE TABLE itc_return_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_name text NOT NULL,
  vendor_gstin text NOT NULL,
  return_invoice_number text NOT NULL,
  invoice_date date,
  return_period text NOT NULL,
  taxable_value numeric(18, 2) NOT NULL DEFAULT 0,
  tax_amount numeric(18, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'import')),
  notes text,
  created_by uuid REFERENCES profiles(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX itc_return_records_org_idx ON itc_return_records(organization_id);
CREATE INDEX itc_return_records_org_period_idx ON itc_return_records(organization_id, return_period);
CREATE INDEX itc_return_records_vendor_idx ON itc_return_records(vendor_id);
-- Prevents double-entry of the same filed return line. Partial (not a
-- table-wide unique constraint) so a row with a still-blank invoice
-- number during manual entry can never collide.
CREATE UNIQUE INDEX itc_return_records_org_gstin_invoice_uidx
  ON itc_return_records(organization_id, upper(vendor_gstin), upper(return_invoice_number))
  WHERE deleted_at IS NULL;

ALTER TABLE itc_return_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_itc_return_records_read" ON itc_return_records FOR SELECT TO authenticated
  USING (public.is_organization_member(organization_id));
CREATE POLICY "tenant_itc_return_records_write" ON itc_return_records FOR INSERT TO authenticated
  WITH CHECK (public.is_organization_member(organization_id) AND created_by = auth.uid());
CREATE POLICY "tenant_itc_return_records_update" ON itc_return_records FOR UPDATE TO authenticated
  USING (public.is_organization_member(organization_id)) WITH CHECK (public.is_organization_member(organization_id));

-- =========================================================================
-- RPCs
-- =========================================================================

CREATE OR REPLACE FUNCTION public.create_itc_return_record(
  target_organization uuid, vendor_gstin_value text, vendor_name_value text,
  return_invoice_number_value text, invoice_date_value date, return_period_value text,
  taxable_value_amount numeric, tax_amount_value numeric, currency_value text DEFAULT 'INR',
  request_id text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_id uuid; normalized_gstin text; matched_vendor uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(target_organization) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  normalized_gstin := upper(trim(vendor_gstin_value));
  IF normalized_gstin = '' OR length(normalized_gstin) > 20 THEN
    RAISE EXCEPTION 'A valid vendor GSTIN is required' USING ERRCODE = '22023';
  END IF;
  IF length(trim(vendor_name_value)) = 0 THEN
    RAISE EXCEPTION 'Vendor name is required' USING ERRCODE = '22023';
  END IF;
  IF length(trim(return_invoice_number_value)) = 0 THEN
    RAISE EXCEPTION 'Return invoice number is required' USING ERRCODE = '22023';
  END IF;
  IF length(trim(return_period_value)) = 0 THEN
    RAISE EXCEPTION 'Return period is required' USING ERRCODE = '22023';
  END IF;
  IF taxable_value_amount < 0 OR tax_amount_value < 0 THEN
    RAISE EXCEPTION 'Amounts cannot be negative' USING ERRCODE = '22023';
  END IF;
  IF currency_value NOT IN ('USD', 'EUR', 'INR') THEN
    RAISE EXCEPTION 'Unsupported currency' USING ERRCODE = '22023';
  END IF;

  -- Auto-link to an existing vendor when its tax identifier matches --
  -- purely a convenience for drill-down; matching itself is done on the
  -- stored GSTIN/invoice-number text, not this link.
  SELECT id INTO matched_vendor FROM vendors
    WHERE organization_id = target_organization AND upper(tax_identifier) = normalized_gstin
    LIMIT 1;

  INSERT INTO itc_return_records (
    organization_id, vendor_id, vendor_name, vendor_gstin, return_invoice_number,
    invoice_date, return_period, taxable_value, tax_amount, currency, source, created_by
  ) VALUES (
    target_organization, matched_vendor, trim(vendor_name_value), normalized_gstin, trim(return_invoice_number_value),
    invoice_date_value, trim(return_period_value), taxable_value_amount, tax_amount_value, currency_value, 'manual', auth.uid()
  )
  RETURNING id INTO result_id;

  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_organization, auth.uid(), NULL, 'create', 'itc_return_record', result_id, request_id);

  RETURN result_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_itc_return_record(uuid, text, text, text, date, text, numeric, numeric, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_itc_return_record(uuid, text, text, text, date, text, numeric, numeric, text, text) TO authenticated;

-- Bulk import: same validation as create_itc_return_record per row, but
-- duplicates (same org + GSTIN + invoice number already on file) are
-- skipped rather than failing the whole batch, since a re-imported CSV
-- overlapping a previous one is the expected common case, not an error.
CREATE OR REPLACE FUNCTION public.import_itc_return_records(
  target_organization uuid, records jsonb, request_id text DEFAULT NULL
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  record_item jsonb; inserted_count integer := 0; batch_id uuid := gen_random_uuid();
  normalized_gstin text; matched_vendor uuid; new_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(target_organization) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(records) != 'array' THEN
    RAISE EXCEPTION 'records must be a JSON array' USING ERRCODE = '22023';
  END IF;

  FOR record_item IN SELECT * FROM jsonb_array_elements(records) LOOP
    normalized_gstin := upper(trim(coalesce(record_item->>'vendorGstin', '')));
    IF normalized_gstin = '' OR length(trim(coalesce(record_item->>'vendorName', ''))) = 0
      OR length(trim(coalesce(record_item->>'returnInvoiceNumber', ''))) = 0
      OR length(trim(coalesce(record_item->>'returnPeriod', ''))) = 0 THEN
      CONTINUE; -- skip incomplete rows rather than aborting the whole import
    END IF;

    SELECT id INTO matched_vendor FROM vendors
      WHERE organization_id = target_organization AND upper(tax_identifier) = normalized_gstin
      LIMIT 1;

    INSERT INTO itc_return_records (
      organization_id, vendor_id, vendor_name, vendor_gstin, return_invoice_number,
      invoice_date, return_period, taxable_value, tax_amount, currency, source, created_by
    ) VALUES (
      target_organization, matched_vendor, trim(record_item->>'vendorName'), normalized_gstin, trim(record_item->>'returnInvoiceNumber'),
      nullif(record_item->>'invoiceDate', '')::date, trim(record_item->>'returnPeriod'),
      coalesce((record_item->>'taxableValue')::numeric, 0), coalesce((record_item->>'taxAmount')::numeric, 0),
      coalesce(nullif(record_item->>'currency', ''), 'INR'), 'import', auth.uid()
    )
    ON CONFLICT (organization_id, upper(vendor_gstin), upper(return_invoice_number)) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO new_id;

    IF new_id IS NOT NULL THEN
      inserted_count := inserted_count + 1;
    END IF;
  END LOOP;

  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id, changes)
  VALUES (target_organization, auth.uid(), NULL, 'create', 'itc_return_record_import', batch_id, request_id, jsonb_build_object('insertedCount', inserted_count));

  RETURN inserted_count;
END;
$$;
REVOKE ALL ON FUNCTION public.import_itc_return_records(uuid, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_itc_return_records(uuid, jsonb, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_itc_return_record(target_record uuid, request_id text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid;
BEGIN
  SELECT organization_id INTO target_org FROM itc_return_records WHERE id = target_record AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  UPDATE itc_return_records SET deleted_at = now(), updated_at = now() WHERE id = target_record;
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), NULL, 'delete', 'itc_return_record', target_record, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.delete_itc_return_record(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_itc_return_record(uuid, text) TO authenticated;

-- Same default-ACL gap documented in migration 0020: this project has an
-- ALTER DEFAULT PRIVILEGES rule that auto-grants EXECUTE to anon on every
-- new public-schema function at CREATE time, regardless of the REVOKE ALL
-- FROM PUBLIC above. Each function's own auth.uid() IS NULL check already
-- stops an anonymous caller, but this makes the database grant itself
-- match that intent instead of relying solely on the function body.
REVOKE EXECUTE ON FUNCTION public.create_itc_return_record(uuid, text, text, text, date, text, numeric, numeric, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.import_itc_return_records(uuid, jsonb, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_itc_return_record(uuid, text) FROM anon;
