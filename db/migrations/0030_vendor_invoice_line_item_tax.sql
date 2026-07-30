-- Bills Tax Completion & ITC Integration: vendor_invoices.tax_total has
-- been dead weight since 0014 -- no RPC ever wrote to it, so purchase
-- invoices never carried real tax data for the ITC Recovery &
-- Reconciliation module. add_vendor_invoice_line_item already computes
-- subtotal/total additively; this adds a per-line tax_amount (mirrors
-- AR's existing-but-unused invoice_items.tax_amount column) and updates
-- tax_total the same additive way, reusing the existing pattern rather
-- than introducing a separate tax calculation path.

ALTER TABLE "vendor_invoice_items" ADD COLUMN "tax_amount" numeric(18, 2) NOT NULL DEFAULT 0;

DROP FUNCTION IF EXISTS public.add_vendor_invoice_line_item(uuid, text, numeric, numeric);

CREATE OR REPLACE FUNCTION public.add_vendor_invoice_line_item(
  target_vendor_invoice uuid, line_description text, line_quantity numeric, line_unit_price numeric, line_tax_amount numeric DEFAULT 0
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; invoice_state vendor_invoice_status; next_position integer; result_id uuid; line_total numeric(18, 2); line_tax numeric(18, 2);
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
  IF line_tax_amount IS NULL OR line_tax_amount < 0 THEN
    RAISE EXCEPTION 'Invalid tax amount' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(MAX(position), 0) + 1 INTO next_position FROM vendor_invoice_items WHERE vendor_invoice_id = target_vendor_invoice;
  line_total := round(line_quantity * line_unit_price, 2);
  line_tax := round(line_tax_amount, 2);

  INSERT INTO vendor_invoice_items (organization_id, vendor_invoice_id, position, description, quantity, unit_price, line_total, tax_amount)
  VALUES (target_org, target_vendor_invoice, next_position, trim(line_description), line_quantity, line_unit_price, line_total, line_tax)
  RETURNING id INTO result_id;

  UPDATE vendor_invoices SET
    subtotal = COALESCE(subtotal, 0) + line_total,
    tax_total = COALESCE(tax_total, 0) + line_tax,
    total = COALESCE(subtotal, 0) + line_total + COALESCE(tax_total, 0) + line_tax,
    updated_at = now(),
    version = version + 1
  WHERE id = target_vendor_invoice;

  RETURN result_id;
END;
$$;
REVOKE ALL ON FUNCTION public.add_vendor_invoice_line_item(uuid, text, numeric, numeric, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_vendor_invoice_line_item(uuid, text, numeric, numeric, numeric) TO authenticated;
-- Explicit anon revoke: ALTER DEFAULT PRIVILEGES on this project
-- auto-grants EXECUTE to anon on every new function regardless of the
-- REVOKE ALL FROM PUBLIC above (first documented in 0020, re-confirmed
-- in 0029). This is a new function signature, so it needs its own revoke.
REVOKE EXECUTE ON FUNCTION public.add_vendor_invoice_line_item(uuid, text, numeric, numeric, numeric) FROM anon;
