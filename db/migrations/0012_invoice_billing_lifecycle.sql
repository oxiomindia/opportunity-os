-- V1 AR pivot, final piece: invoices bill a customer instead of processing a
-- vendor invoice. The table is empty in every environment this has been
-- applied to, so this is a clean structural replacement, not a data
-- migration -- there are no existing rows to preserve or cast.

-- 1. Replace the AP-approval status enum with a billing lifecycle.
ALTER TYPE invoice_status RENAME TO invoice_status_old;
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'partially-paid', 'paid', 'overdue', 'void');

ALTER TABLE invoices ALTER COLUMN status DROP DEFAULT;
ALTER TABLE invoices ALTER COLUMN status TYPE invoice_status USING status::text::invoice_status;
ALTER TABLE invoices ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE invoice_status_history ALTER COLUMN from_status TYPE invoice_status USING from_status::text::invoice_status;
ALTER TABLE invoice_status_history ALTER COLUMN to_status TYPE invoice_status USING to_status::text::invoice_status;

DROP TYPE invoice_status_old;

-- 2. Invoices bill a customer; vendor_id is retired from the write path
-- (column kept, unused, to avoid a destructive drop of a FK other rows
-- might reference in the future -- revisit in a later cleanup pass).
ALTER TABLE invoices ADD COLUMN customer_id uuid REFERENCES public.customers(id);
ALTER TABLE invoices DROP COLUMN extraction_confidence;
ALTER TABLE invoices DROP COLUMN source;
CREATE INDEX invoices_org_customer_idx ON invoices USING btree (organization_id, customer_id);

-- 3. Invoice lines can reference the product/service catalog.
ALTER TABLE invoice_items ADD COLUMN product_id uuid REFERENCES public.products_services(id);

-- 4. Retire the AP-specific intake functions; they operated on the old
-- status set and the vendor-upload flow that no longer exists in V1.
DROP FUNCTION IF EXISTS public.create_uploaded_invoice(uuid, uuid, uuid, text, text, text, bigint, text, text);
DROP FUNCTION IF EXISTS public.manage_invoice_lifecycle(uuid, text, text);

-- 5. Billing lifecycle functions.
CREATE OR REPLACE FUNCTION public.create_invoice(
  target_organization uuid, target_customer uuid, invoice_date_value date,
  due_date_value date, invoice_currency text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(target_organization) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = target_customer AND organization_id = target_organization) THEN
    RAISE EXCEPTION 'Customer not found' USING ERRCODE = '22023';
  END IF;
  IF invoice_currency NOT IN ('USD', 'EUR', 'INR') THEN
    RAISE EXCEPTION 'Unsupported currency' USING ERRCODE = '22023';
  END IF;
  INSERT INTO invoices (organization_id, customer_id, invoice_date, due_date, currency, status, subtotal, tax_total, total, created_by)
  VALUES (target_organization, target_customer, invoice_date_value, due_date_value, invoice_currency, 'draft', 0, 0, 0, auth.uid())
  RETURNING id INTO result_id;
  INSERT INTO invoice_status_history (organization_id, invoice_id, to_status, reason, changed_by)
  VALUES (target_organization, result_id, 'draft', 'Invoice created', auth.uid());
  RETURN result_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_invoice(uuid, uuid, date, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invoice(uuid, uuid, date, date, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.add_invoice_line_item(
  target_invoice uuid, line_product uuid, line_description text,
  line_quantity numeric, line_unit_price numeric
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state invoice_status; next_position integer; result_id uuid; line_total numeric(18, 2);
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM invoices WHERE id = target_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'draft' THEN
    RAISE EXCEPTION 'Only draft invoices can be edited' USING ERRCODE = '42501';
  END IF;
  IF length(trim(line_description)) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'Invalid line description' USING ERRCODE = '22023';
  END IF;
  IF line_quantity <= 0 OR line_unit_price < 0 THEN
    RAISE EXCEPTION 'Invalid quantity or unit price' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(MAX(position), 0) + 1 INTO next_position FROM invoice_items WHERE invoice_id = target_invoice;
  line_total := round(line_quantity * line_unit_price, 2);

  INSERT INTO invoice_items (organization_id, invoice_id, product_id, position, description, quantity, unit_price, line_total)
  VALUES (target_org, target_invoice, line_product, next_position, trim(line_description), line_quantity, line_unit_price, line_total)
  RETURNING id INTO result_id;

  UPDATE invoices SET
    subtotal = COALESCE(subtotal, 0) + line_total,
    total = COALESCE(subtotal, 0) + line_total + COALESCE(tax_total, 0),
    updated_at = now(),
    version = version + 1
  WHERE id = target_invoice;

  RETURN result_id;
END;
$$;
REVOKE ALL ON FUNCTION public.add_invoice_line_item(uuid, uuid, text, numeric, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_invoice_line_item(uuid, uuid, text, numeric, numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.send_invoice(target_invoice uuid, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state invoice_status; item_count integer;
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM invoices WHERE id = target_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'draft' THEN
    RAISE EXCEPTION 'Only draft invoices can be sent' USING ERRCODE = '42501';
  END IF;
  SELECT count(*) INTO item_count FROM invoice_items WHERE invoice_id = target_invoice;
  IF item_count = 0 THEN
    RAISE EXCEPTION 'Add at least one line item before sending' USING ERRCODE = '22023';
  END IF;

  UPDATE invoices SET status = 'sent', updated_at = now(), version = version + 1 WHERE id = target_invoice;
  INSERT INTO invoice_status_history (organization_id, invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_invoice, 'draft', 'sent', 'Invoice sent to customer', auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), target_invoice, 'status-change', 'invoice', target_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.send_invoice(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_invoice(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_invoice_payment(target_invoice uuid, payment_amount numeric, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state invoice_status; invoice_total numeric(18, 2); next_status invoice_status;
BEGIN
  SELECT organization_id, status, total INTO target_org, invoice_state, invoice_total FROM invoices WHERE id = target_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state NOT IN ('sent', 'viewed', 'partially-paid', 'overdue') THEN
    RAISE EXCEPTION 'Invoice is not awaiting payment' USING ERRCODE = '42501';
  END IF;
  IF payment_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive' USING ERRCODE = '22023';
  END IF;

  next_status := CASE WHEN payment_amount >= invoice_total THEN 'paid' ELSE 'partially-paid' END;
  UPDATE invoices SET status = next_status, updated_at = now(), version = version + 1 WHERE id = target_invoice;
  INSERT INTO invoice_status_history (organization_id, invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_invoice, invoice_state, next_status, format('Payment of %s recorded', payment_amount), auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), target_invoice, 'status-change', 'invoice', target_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.record_invoice_payment(uuid, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_invoice_payment(uuid, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.void_invoice(target_invoice uuid, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state invoice_status;
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM invoices WHERE id = target_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state = 'paid' THEN
    RAISE EXCEPTION 'Paid invoices cannot be voided' USING ERRCODE = '42501';
  END IF;

  UPDATE invoices SET status = 'void', updated_at = now(), version = version + 1 WHERE id = target_invoice;
  INSERT INTO invoice_status_history (organization_id, invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_invoice, invoice_state, 'void', 'Invoice voided', auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), target_invoice, 'status-change', 'invoice', target_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.void_invoice(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.void_invoice(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_draft_invoice(target_invoice uuid, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state invoice_status;
BEGIN
  SELECT organization_id, status INTO target_org, invoice_state FROM invoices WHERE id = target_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF invoice_state != 'draft' THEN
    RAISE EXCEPTION 'Only draft invoices can be deleted' USING ERRCODE = '42501';
  END IF;

  UPDATE invoices SET deleted_at = now(), updated_at = now(), version = version + 1 WHERE id = target_invoice;
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), target_invoice, 'delete', 'invoice', target_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.delete_draft_invoice(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_draft_invoice(uuid, text) TO authenticated;
