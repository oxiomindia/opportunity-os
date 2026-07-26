INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('invoice-attachments', 'invoice-attachments', false, 26214400, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "tenant_attachment_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'invoice-attachments' AND public.is_organization_member((storage.foldername(name))[1]::uuid));
CREATE POLICY "tenant_attachment_read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'invoice-attachments' AND public.is_organization_member((storage.foldername(name))[1]::uuid));
CREATE POLICY "tenant_attachment_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'invoice-attachments' AND public.is_organization_member((storage.foldername(name))[1]::uuid));

CREATE OR REPLACE FUNCTION public.create_uploaded_invoice(
  target_organization uuid, invoice_id uuid, attachment_id uuid, storage_key text,
  original_name text, mime_type text, size_bytes bigint, file_sha256 text, request_id text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(target_organization) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF mime_type NOT IN ('application/pdf', 'image/png', 'image/jpeg') OR size_bytes < 1 OR size_bytes > 26214400 THEN
    RAISE EXCEPTION 'Invalid attachment';
  END IF;
  IF storage_key NOT LIKE target_organization::text || '/' || invoice_id::text || '/%' OR file_sha256 !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid attachment identity';
  END IF;
  INSERT INTO invoices (id, organization_id, status, source, currency, created_by)
    VALUES (invoice_id, target_organization, 'received', 'manual-upload', 'USD', auth.uid());
  INSERT INTO attachments (id, organization_id, invoice_id, storage_key, original_name, mime_type, size_bytes, sha256, status, created_by)
    VALUES (attachment_id, target_organization, invoice_id, storage_key, left(original_name, 255), mime_type, size_bytes, file_sha256, 'stored', auth.uid());
  INSERT INTO invoice_status_history (organization_id, invoice_id, to_status, reason, changed_by)
    VALUES (target_organization, invoice_id, 'received', 'Manual upload', auth.uid());
  INSERT INTO audit_logs (organization_id, actor_id, invoice_id, action, entity_type, entity_id, request_id)
    VALUES (target_organization, auth.uid(), invoice_id, 'upload', 'invoice', invoice_id, request_id);
  RETURN invoice_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_uploaded_invoice(uuid, uuid, uuid, text, text, text, bigint, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_uploaded_invoice(uuid, uuid, uuid, text, text, text, bigint, text, text) TO authenticated;
