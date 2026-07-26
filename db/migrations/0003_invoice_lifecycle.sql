CREATE OR REPLACE FUNCTION public.manage_invoice_lifecycle(target_invoice uuid, operation text, request_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_org uuid; prior_status invoice_status;
BEGIN
  SELECT organization_id, status INTO target_org, prior_status FROM invoices WHERE id = target_invoice AND deleted_at IS NULL FOR UPDATE;
  IF target_org IS NULL OR NOT public.is_organization_member(target_org) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501'; END IF;
  IF operation = 'archive' THEN
    UPDATE invoices SET status = 'archived', archived_at = now(), updated_at = now(), version = version + 1 WHERE id = target_invoice;
    INSERT INTO invoice_status_history (organization_id, invoice_id, from_status, to_status, reason, changed_by) VALUES (target_org, target_invoice, prior_status, 'archived', 'Archived by user', auth.uid());
    INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id) VALUES (target_org, auth.uid(), target_invoice, 'archive', 'invoice', target_invoice, request_id);
  ELSIF operation = 'delete' THEN
    IF NOT public.has_organization_role(target_org, ARRAY['owner','admin']::member_role[]) THEN RAISE EXCEPTION 'Administrator role required' USING ERRCODE = '42501'; END IF;
    UPDATE invoices SET deleted_at = now(), updated_at = now(), version = version + 1 WHERE id = target_invoice;
    INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id) VALUES (target_org, auth.uid(), target_invoice, 'delete', 'invoice', target_invoice, request_id);
  ELSE RAISE EXCEPTION 'Unsupported operation';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.manage_invoice_lifecycle(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.manage_invoice_lifecycle(uuid, text, text) TO authenticated;
