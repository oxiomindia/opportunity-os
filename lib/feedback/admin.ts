import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '../auth/dal';
import { createSupabaseServerClient } from '../supabase/server';

export type PlatformAdminRole = 'product-admin' | 'security-admin' | 'platform-admin';
export const getPlatformAdmin = cache(async () => {
  const user = await getAuthenticatedUser(); if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('platform_admins').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  return data ? { user, role: data.role as PlatformAdminRole } : null;
});
export async function requirePlatformAdmin() { const admin = await getPlatformAdmin(); if (!admin) redirect('/dashboard?error=forbidden'); return admin; }

export async function listAdminFeedback(options: { urgent?: boolean; status?: string; category?: string; search?: string; before?: string }) {
  await requirePlatformAdmin(); const supabase = await createSupabaseServerClient();
  let query = supabase.from('feedback_submissions').select('id,organization_id,pros,cons,category,feature_area,status,human_priority,engine_suggested_priority,urgent_review,anonymous_to_product_team,submitted_at,organizations(name)').is('soft_deleted_at', null).order('submitted_at', { ascending: false }).limit(50);
  if (options.urgent) query = query.eq('urgent_review', true).not('status', 'in', '(resolved,declined,duplicate)');
  if (options.status) query = query.eq('status', options.status); if (options.category) query = query.eq('category', options.category);
  if (options.search) query = query.or(`pros.ilike.%${options.search.replace(/[%_,()]/g, '')}%,cons.ilike.%${options.search.replace(/[%_,()]/g, '')}%`);
  if (options.before) query = query.lt('submitted_at', options.before);
  const { data, error } = await query; if (error) throw new Error(`Unable to load feedback: ${error.code}`); return data ?? [];
}

export async function getAdminFeedback(id: string) {
  const admin = await requirePlatformAdmin(); const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('feedback_submissions').select('*,organizations(name),feedback_status_history(previous_status,new_status,change_reason,changed_at),feedback_admin_notes(id,note,created_at)').eq('id', id).maybeSingle();
  if (error || !data) return null;
  let identity: { user_id: string } | null = null;
  if (!data.anonymous_to_product_team || admin.role !== 'product-admin') {
    const result = await supabase.from('feedback_source_identities').select('user_id').eq('feedback_id', id).maybeSingle(); identity = result.data;
  }
  return { ...data, sourceUserId: identity?.user_id ?? null, viewerRole: admin.role };
}

export async function getAdminOverview() {
  await requirePlatformAdmin(); const supabase=await createSupabaseServerClient();const weekStart=new Date();weekStart.setUTCDate(weekStart.getUTCDate()-7);
  const [week,urgent,newItems,review,planned,resolved,latest]=await Promise.all([
    supabase.from('feedback_submissions').select('organization_id',{count:'exact'}).gte('submitted_at',weekStart.toISOString()).is('soft_deleted_at',null),
    supabase.from('feedback_submissions').select('id',{count:'exact',head:true}).eq('urgent_review',true).not('status','in','(resolved,declined,duplicate)').is('soft_deleted_at',null),
    supabase.from('feedback_submissions').select('id',{count:'exact',head:true}).eq('status','new').is('soft_deleted_at',null),
    supabase.from('feedback_submissions').select('id',{count:'exact',head:true}).eq('status','under-review').is('soft_deleted_at',null),
    supabase.from('feedback_submissions').select('id',{count:'exact',head:true}).eq('status','planned').is('soft_deleted_at',null),
    supabase.from('feedback_submissions').select('id',{count:'exact',head:true}).eq('status','resolved').is('soft_deleted_at',null),
    supabase.from('feedback_weekly_reports').select('id,generated_summary,period_start,period_end').order('period_start',{ascending:false}).limit(1).maybeSingle(),
  ]);
  return {week:week.count??0,organizations:new Set((week.data??[]).map(row=>row.organization_id)).size,urgent:urgent.count??0,newItems:newItems.count??0,review:review.count??0,planned:planned.count??0,resolved:resolved.count??0,latest:latest.data};
}
