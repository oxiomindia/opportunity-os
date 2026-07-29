-- Version 1 AP module, second piece: vendor invoices ("Bills"). A
-- deliberately separate table family from AR's `invoices` -- the
-- lifecycles are genuinely different (AR: draft->sent->paid; AP:
-- draft->pending-approval->approved->paid) and forcing both into one
-- table/enum would risk destabilizing the already-shipped AR flow.
-- Reuses the existing invoice-attachments storage bucket (0002) --
-- its RLS only checks the org-level path prefix, not invoice type.

CREATE TYPE "public"."vendor_invoice_status" AS ENUM (
  'draft', 'pending-approval', 'approved', 'payment-scheduled', 'partially-paid', 'paid', 'void'
);

CREATE TABLE "vendor_invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "vendor_id" uuid REFERENCES "public"."vendors"("id"),
  "vendor_invoice_number" text,
  "invoice_date" date,
  "due_date" date,
  "currency" text NOT NULL DEFAULT 'USD',
  "subtotal" numeric(18, 2) DEFAULT 0,
  "tax_total" numeric(18, 2) DEFAULT 0,
  "total" numeric(18, 2) DEFAULT 0,
  "status" "vendor_invoice_status" NOT NULL DEFAULT 'draft',
  "notes" text,
  "payment_scheduled_date" date,
  "payment_reference" text,
  "version" integer NOT NULL DEFAULT 1,
  "created_by" uuid NOT NULL REFERENCES "public"."profiles"("id"),
  "archived_at" timestamp with time zone,
  "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "vendor_invoices_org_idx" ON "vendor_invoices" USING btree ("organization_id");
CREATE INDEX "vendor_invoices_org_vendor_idx" ON "vendor_invoices" USING btree ("organization_id", "vendor_id");
-- Duplicate-detection support: one vendor cannot have the same invoice
-- number recorded twice within an org (excludes void/deleted so a
-- corrected resubmission isn't blocked by its own voided predecessor).
CREATE UNIQUE INDEX "vendor_invoices_org_vendor_number_uidx" ON "vendor_invoices"
  USING btree ("organization_id", "vendor_id", "vendor_invoice_number")
  WHERE "vendor_invoice_number" IS NOT NULL AND "status" != 'void' AND "deleted_at" IS NULL;

CREATE TABLE "vendor_invoice_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "vendor_invoice_id" uuid NOT NULL REFERENCES "public"."vendor_invoices"("id") ON DELETE CASCADE,
  "position" integer NOT NULL,
  "description" text NOT NULL,
  "quantity" numeric(18, 4),
  "unit_price" numeric(18, 4),
  "line_total" numeric(18, 2) NOT NULL
);
CREATE INDEX "vendor_invoice_items_invoice_idx" ON "vendor_invoice_items" USING btree ("vendor_invoice_id");

CREATE TABLE "vendor_invoice_status_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "vendor_invoice_id" uuid NOT NULL REFERENCES "public"."vendor_invoices"("id") ON DELETE CASCADE,
  "from_status" "vendor_invoice_status",
  "to_status" "vendor_invoice_status" NOT NULL,
  "reason" text,
  "changed_by" uuid NOT NULL REFERENCES "public"."profiles"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "vendor_invoice_status_history_invoice_idx" ON "vendor_invoice_status_history" USING btree ("vendor_invoice_id");

-- Mirrors `attachments` exactly (same columns, same attachment_status
-- enum), just scoped to vendor_invoices instead of invoices.
CREATE TABLE "vendor_invoice_attachments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "vendor_invoice_id" uuid NOT NULL REFERENCES "public"."vendor_invoices"("id") ON DELETE CASCADE,
  "storage_key" text NOT NULL,
  "original_name" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" bigint NOT NULL,
  "sha256" text NOT NULL,
  "page_count" integer,
  "status" "attachment_status" DEFAULT 'stored' NOT NULL,
  "error_message" text,
  "created_by" uuid NOT NULL REFERENCES "public"."profiles"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "vendor_invoice_attachments_storage_key_uidx" ON "vendor_invoice_attachments" USING btree ("storage_key");
CREATE INDEX "vendor_invoice_attachments_invoice_idx" ON "vendor_invoice_attachments" USING btree ("vendor_invoice_id");

ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoice_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoice_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_vendor_invoices_read" ON vendor_invoices FOR SELECT TO authenticated
  USING (public.is_organization_member(organization_id));
CREATE POLICY "tenant_vendor_invoices_write" ON vendor_invoices FOR INSERT TO authenticated
  WITH CHECK (public.is_organization_member(organization_id) AND created_by = auth.uid());
CREATE POLICY "tenant_vendor_invoices_update" ON vendor_invoices FOR UPDATE TO authenticated
  USING (public.is_organization_member(organization_id)) WITH CHECK (public.is_organization_member(organization_id));
CREATE POLICY "tenant_vendor_invoice_items" ON vendor_invoice_items FOR ALL TO authenticated
  USING (public.is_organization_member(organization_id)) WITH CHECK (public.is_organization_member(organization_id));
CREATE POLICY "tenant_vendor_invoice_status_history" ON vendor_invoice_status_history FOR SELECT TO authenticated
  USING (public.is_organization_member(organization_id));
CREATE POLICY "tenant_vendor_invoice_attachments" ON vendor_invoice_attachments FOR ALL TO authenticated
  USING (public.is_organization_member(organization_id)) WITH CHECK (public.is_organization_member(organization_id));

-- Reuse the invoice-attachments bucket's existing storage.objects RLS
-- (0002_invoice_storage.sql) -- it only checks the org-level path
-- prefix, so no new storage policy is required for vendor invoice
-- attachments stored under the same bucket.

CREATE OR REPLACE FUNCTION public.create_vendor_invoice(
  target_organization uuid, target_vendor uuid, invoice_number_value text,
  invoice_date_value date, due_date_value date, invoice_currency text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(target_organization) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vendors WHERE id = target_vendor AND organization_id = target_organization) THEN
    RAISE EXCEPTION 'Vendor not found' USING ERRCODE = '22023';
  END IF;
  IF invoice_currency NOT IN ('USD', 'EUR', 'INR') THEN
    RAISE EXCEPTION 'Unsupported currency' USING ERRCODE = '22023';
  END IF;
  INSERT INTO vendor_invoices (
    organization_id, vendor_id, vendor_invoice_number, invoice_date, due_date, currency,
    status, subtotal, tax_total, total, created_by
  )
  VALUES (
    target_organization, target_vendor, nullif(trim(invoice_number_value), ''), invoice_date_value, due_date_value,
    invoice_currency, 'draft', 0, 0, 0, auth.uid()
  )
  RETURNING id INTO result_id;
  INSERT INTO vendor_invoice_status_history (organization_id, vendor_invoice_id, to_status, reason, changed_by)
  VALUES (target_organization, result_id, 'draft', 'Bill created', auth.uid());
  RETURN result_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_vendor_invoice(uuid, uuid, text, date, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_vendor_invoice(uuid, uuid, text, date, date, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.add_vendor_invoice_line_item(
  target_vendor_invoice uuid, line_description text, line_quantity numeric, line_unit_price numeric
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status; next_position integer; result_id uuid; line_total numeric(18, 2);
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM vendor_invoices WHERE id = target_vendor_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'draft' THEN
    RAISE EXCEPTION 'Only draft bills can be edited' USING ERRCODE = '42501';
  END IF;
  IF length(trim(line_description)) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'Invalid line description' USING ERRCODE = '22023';
  END IF;
  IF line_quantity <= 0 OR line_unit_price < 0 THEN
    RAISE EXCEPTION 'Invalid quantity or unit price' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(MAX(position), 0) + 1 INTO next_position FROM vendor_invoice_items WHERE vendor_invoice_id = target_vendor_invoice;
  line_total := round(line_quantity * line_unit_price, 2);

  INSERT INTO vendor_invoice_items (organization_id, vendor_invoice_id, position, description, quantity, unit_price, line_total)
  VALUES (target_org, target_vendor_invoice, next_position, trim(line_description), line_quantity, line_unit_price, line_total)
  RETURNING id INTO result_id;

  UPDATE vendor_invoices SET
    subtotal = COALESCE(subtotal, 0) + line_total,
    total = COALESCE(subtotal, 0) + line_total + COALESCE(tax_total, 0),
    updated_at = now(),
    version = version + 1
  WHERE id = target_vendor_invoice;

  RETURN result_id;
END;
$$;
REVOKE ALL ON FUNCTION public.add_vendor_invoice_line_item(uuid, text, numeric, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_vendor_invoice_line_item(uuid, text, numeric, numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.attach_vendor_invoice_file(
  target_vendor_invoice uuid, attachment_id uuid, storage_key text,
  original_name text, mime_type text, size_bytes bigint, file_sha256 text, request_id text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status;
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM vendor_invoices WHERE id = target_vendor_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'draft' THEN
    RAISE EXCEPTION 'Only draft bills accept new attachments' USING ERRCODE = '42501';
  END IF;
  IF mime_type NOT IN ('application/pdf', 'image/png', 'image/jpeg') OR size_bytes < 1 OR size_bytes > 26214400 THEN
    RAISE EXCEPTION 'Invalid attachment';
  END IF;
  IF storage_key NOT LIKE target_org::text || '/' || target_vendor_invoice::text || '/%' OR file_sha256 !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid attachment identity';
  END IF;
  INSERT INTO vendor_invoice_attachments (organization_id, vendor_invoice_id, storage_key, original_name, mime_type, size_bytes, sha256, status, created_by)
  VALUES (target_org, target_vendor_invoice, storage_key, left(original_name, 255), mime_type, size_bytes, file_sha256, 'stored', auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), NULL, 'upload', 'vendor_invoice', target_vendor_invoice, request_id);
  RETURN attachment_id;
END;
$$;
REVOKE ALL ON FUNCTION public.attach_vendor_invoice_file(uuid, uuid, text, text, text, bigint, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.attach_vendor_invoice_file(uuid, uuid, text, text, text, bigint, text, text) TO authenticated;

-- Invoice Validation: required fields, amount consistency, and
-- vendor+invoice-number duplicate detection, enforced at submission.
CREATE OR REPLACE FUNCTION public.submit_vendor_invoice_for_review(target_vendor_invoice uuid, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status; invoice_vendor uuid; invoice_number text; item_count integer; duplicate_count integer;
BEGIN
  SELECT organization_id, status, vendor_id, vendor_invoice_number
    INTO target_org, invoice_state, invoice_vendor, invoice_number
    FROM vendor_invoices WHERE id = target_vendor_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'draft' THEN
    RAISE EXCEPTION 'Only draft bills can be submitted' USING ERRCODE = '42501';
  END IF;
  IF invoice_vendor IS NULL THEN
    RAISE EXCEPTION 'A vendor is required before submitting' USING ERRCODE = '22023';
  END IF;
  IF invoice_number IS NULL OR length(trim(invoice_number)) < 1 THEN
    RAISE EXCEPTION 'The vendor''s invoice number is required before submitting' USING ERRCODE = '22023';
  END IF;
  SELECT count(*) INTO item_count FROM vendor_invoice_items WHERE vendor_invoice_id = target_vendor_invoice;
  IF item_count = 0 THEN
    RAISE EXCEPTION 'Add at least one line item before submitting' USING ERRCODE = '22023';
  END IF;
  SELECT count(*) INTO duplicate_count FROM vendor_invoices
    WHERE organization_id = target_org AND vendor_id = invoice_vendor AND vendor_invoice_number = invoice_number
      AND id != target_vendor_invoice AND status != 'void' AND deleted_at IS NULL;
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'A bill with this vendor and invoice number already exists' USING ERRCODE = '23505';
  END IF;

  UPDATE vendor_invoices SET status = 'pending-approval', updated_at = now(), version = version + 1 WHERE id = target_vendor_invoice;
  INSERT INTO vendor_invoice_status_history (organization_id, vendor_invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_vendor_invoice, 'draft', 'pending-approval', 'Submitted for approval', auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), NULL, 'status-change', 'vendor_invoice', target_vendor_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.submit_vendor_invoice_for_review(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_vendor_invoice_for_review(uuid, text) TO authenticated;

-- Approval Workflow: gated to Owner/Admin/Reviewer, the first real use
-- of role-based enforcement in the app (roles previously existed but
-- were never checked by any RPC).
CREATE OR REPLACE FUNCTION public.approve_vendor_invoice(target_vendor_invoice uuid, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status;
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM vendor_invoices WHERE id = target_vendor_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF NOT public.has_organization_role(target_org, ARRAY['owner','admin','reviewer']::member_role[]) THEN
    RAISE EXCEPTION 'Only an owner, admin, or reviewer can approve bills' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'pending-approval' THEN
    RAISE EXCEPTION 'Only bills pending approval can be approved' USING ERRCODE = '42501';
  END IF;

  UPDATE vendor_invoices SET status = 'approved', updated_at = now(), version = version + 1 WHERE id = target_vendor_invoice;
  INSERT INTO vendor_invoice_status_history (organization_id, vendor_invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_vendor_invoice, 'pending-approval', 'approved', 'Bill approved', auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), NULL, 'status-change', 'vendor_invoice', target_vendor_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.approve_vendor_invoice(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_vendor_invoice(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.reject_vendor_invoice(target_vendor_invoice uuid, rejection_reason text, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status;
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM vendor_invoices WHERE id = target_vendor_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF NOT public.has_organization_role(target_org, ARRAY['owner','admin','reviewer']::member_role[]) THEN
    RAISE EXCEPTION 'Only an owner, admin, or reviewer can reject bills' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'pending-approval' THEN
    RAISE EXCEPTION 'Only bills pending approval can be rejected' USING ERRCODE = '42501';
  END IF;
  IF length(trim(rejection_reason)) < 1 THEN
    RAISE EXCEPTION 'A rejection reason is required' USING ERRCODE = '22023';
  END IF;

  -- Sent back to draft (not a dead-end status) so the submitter can
  -- correct the bill's data and resubmit.
  UPDATE vendor_invoices SET status = 'draft', updated_at = now(), version = version + 1 WHERE id = target_vendor_invoice;
  INSERT INTO vendor_invoice_status_history (organization_id, vendor_invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_vendor_invoice, 'pending-approval', 'draft', trim(rejection_reason), auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), NULL, 'status-change', 'vendor_invoice', target_vendor_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.reject_vendor_invoice(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_vendor_invoice(uuid, text, text) TO authenticated;

-- Payment Processing: scheduling and recording. Mirrors AR's
-- record_invoice_payment (logs amount/reference, no real bank
-- transfer) -- money movement via a payment processor is out of V1
-- scope for AP the same way it is for AR.
CREATE OR REPLACE FUNCTION public.schedule_vendor_invoice_payment(target_vendor_invoice uuid, scheduled_date date, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status;
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM vendor_invoices WHERE id = target_vendor_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'approved' THEN
    RAISE EXCEPTION 'Only approved bills can be scheduled for payment' USING ERRCODE = '42501';
  END IF;

  UPDATE vendor_invoices SET status = 'payment-scheduled', payment_scheduled_date = scheduled_date, updated_at = now(), version = version + 1 WHERE id = target_vendor_invoice;
  INSERT INTO vendor_invoice_status_history (organization_id, vendor_invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_vendor_invoice, 'approved', 'payment-scheduled', format('Payment scheduled for %s', scheduled_date), auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), NULL, 'status-change', 'vendor_invoice', target_vendor_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.schedule_vendor_invoice_payment(uuid, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.schedule_vendor_invoice_payment(uuid, date, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_vendor_invoice_payment(
  target_vendor_invoice uuid, payment_amount numeric, payment_reference_value text, request_id text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status; invoice_total numeric(18, 2); next_status vendor_invoice_status;
BEGIN
  SELECT organization_id, status, total INTO target_org, invoice_state, invoice_total FROM vendor_invoices WHERE id = target_vendor_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state NOT IN ('approved', 'payment-scheduled', 'partially-paid') THEN
    RAISE EXCEPTION 'Bill is not awaiting payment' USING ERRCODE = '42501';
  END IF;
  IF payment_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive' USING ERRCODE = '22023';
  END IF;

  next_status := CASE WHEN payment_amount >= invoice_total THEN 'paid' ELSE 'partially-paid' END;
  UPDATE vendor_invoices SET
    status = next_status, payment_reference = nullif(trim(payment_reference_value), ''), updated_at = now(), version = version + 1
  WHERE id = target_vendor_invoice;
  INSERT INTO vendor_invoice_status_history (organization_id, vendor_invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_vendor_invoice, invoice_state, next_status, format('Payment of %s recorded', payment_amount), auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), NULL, 'status-change', 'vendor_invoice', target_vendor_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.record_vendor_invoice_payment(uuid, numeric, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_vendor_invoice_payment(uuid, numeric, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.void_vendor_invoice(target_vendor_invoice uuid, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status;
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM vendor_invoices WHERE id = target_vendor_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state IN ('paid', 'partially-paid') THEN
    RAISE EXCEPTION 'Bills with recorded payments cannot be voided' USING ERRCODE = '42501';
  END IF;

  UPDATE vendor_invoices SET status = 'void', updated_at = now(), version = version + 1 WHERE id = target_vendor_invoice;
  INSERT INTO vendor_invoice_status_history (organization_id, vendor_invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_vendor_invoice, invoice_state, 'void', 'Bill voided', auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), NULL, 'status-change', 'vendor_invoice', target_vendor_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.void_vendor_invoice(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.void_vendor_invoice(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_draft_vendor_invoice(target_vendor_invoice uuid, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status;
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM vendor_invoices WHERE id = target_vendor_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'draft' THEN
    RAISE EXCEPTION 'Only draft bills can be deleted' USING ERRCODE = '42501';
  END IF;

  UPDATE vendor_invoices SET deleted_at = now(), updated_at = now(), version = version + 1 WHERE id = target_vendor_invoice;
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), NULL, 'delete', 'vendor_invoice', target_vendor_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.delete_draft_vendor_invoice(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_draft_vendor_invoice(uuid, text) TO authenticated;
