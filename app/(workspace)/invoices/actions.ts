'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionContext } from '../../../lib/auth/dal';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

async function mutateInvoice(formData: FormData, operation: 'archive' | 'delete') {
  const id = formData.get('id');
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) throw new Error('Invalid invoice identifier.');
  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (operation === 'delete' && !['owner', 'admin'].includes(session.role)) redirect(`/invoices/${id}?error=forbidden`);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('manage_invoice_lifecycle', { target_invoice: id, operation, request_id: crypto.randomUUID() });
  if (error) redirect(`/invoices/${id}?error=mutation`);
  revalidatePath('/dashboard'); revalidatePath('/invoices');
  redirect('/invoices');
}

export async function archiveInvoice(formData: FormData) { await mutateInvoice(formData, 'archive'); }
export async function deleteInvoice(formData: FormData) { await mutateInvoice(formData, 'delete'); }
