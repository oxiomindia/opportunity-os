-- Invoice numbering: invoice_number has existed on `invoices` since the
-- very first migration but nothing has ever populated it -- create_invoice
-- and send_invoice both leave it NULL, so every invoice (even sent ones)
-- falls back to a "DRAFT-XXXXXXXX" placeholder in the UI forever. Adds a
-- per-organization counter and assigns a real number the moment an
-- invoice is sent (not at draft creation, since drafts can be deleted
-- and shouldn't burn a number, and a customer-facing number shouldn't
-- exist before the customer has actually seen it).

ALTER TABLE organizations ADD COLUMN "invoice_number_counter" integer NOT NULL DEFAULT 0;

-- The existing invoices_org_vendor_number_uidx unique index doesn't
-- enforce per-org uniqueness for AR invoices: vendor_id is always NULL
-- on them now, and Postgres treats NULL as distinct in unique indexes.
-- Add the constraint that actually matters for the billing model.
CREATE UNIQUE INDEX "invoices_org_number_uidx" ON invoices USING btree (organization_id, invoice_number) WHERE invoice_number IS NOT NULL;

CREATE OR REPLACE FUNCTION public.send_invoice(target_invoice uuid, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state invoice_status; item_count integer; next_number integer; assigned_number text;
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

  UPDATE organizations SET invoice_number_counter = invoice_number_counter + 1 WHERE id = target_org
    RETURNING invoice_number_counter INTO next_number;
  assigned_number := 'OX-' || to_char(now(), 'YYYY') || '-' || lpad(next_number::text, 4, '0');

  UPDATE invoices SET status = 'sent', invoice_number = assigned_number, updated_at = now(), version = version + 1 WHERE id = target_invoice;
  INSERT INTO invoice_status_history (organization_id, invoice_id, from_status, to_status, reason, changed_by)
  VALUES (target_org, target_invoice, 'draft', 'sent', 'Invoice sent to customer', auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
  VALUES (target_org, auth.uid(), target_invoice, 'status-change', 'invoice', target_invoice, request_id);
END;
$$;
REVOKE ALL ON FUNCTION public.send_invoice(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_invoice(uuid, text) TO authenticated;
