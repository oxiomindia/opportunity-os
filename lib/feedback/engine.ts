import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { buildMetricsOnlyReport, previousReportingPeriod, weeklyRunKey } from './weekly';

export async function runWeeklyFeedbackEngine(options?: { start?: Date; end?: Date }) {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw new Error('Feedback engine storage is not configured.');
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const period=options?.start&&options.end?{start:options.start,end:options.end}:previousReportingPeriod(new Date(),process.env.FEEDBACK_BUSINESS_TIMEZONE??'UTC');
  const idempotencyKey=weeklyRunKey(period.start,period.end);
  const {data:existing}=await admin.from('feedback_engine_runs').select('id,status,output_report_id').eq('idempotency_key',idempotencyKey).maybeSingle();
  if(existing?.status==='completed')return existing;
  const runId=existing?.id??crypto.randomUUID();
  if(!existing){const {error}=await admin.from('feedback_engine_runs').insert({id:runId,period_start:period.start.toISOString(),period_end:period.end.toISOString(),idempotency_key:idempotencyKey,status:'running'});if(error)throw error;}
  console.info(JSON.stringify({event:'feedback.engine_started',runId,periodStart:period.start,periodEnd:period.end}));
  try{
    const {data:feedback,error}=await admin.from('feedback_submissions').select('id,organization_id,pros,cons,category,urgent_review,engine_suggested_priority').gte('submitted_at',period.start.toISOString()).lt('submitted_at',period.end.toISOString()).is('soft_deleted_at',null).not('status','eq','duplicate');if(error)throw error;
    const ids=(feedback??[]).map(item=>item.id);let identityRows:{feedback_id:string;user_id:string}[]=[];
    if(ids.length){const result=await admin.from('feedback_source_identities').select('feedback_id,user_id').in('feedback_id',ids);if(result.error)throw result.error;identityRows=result.data??[];}
    const users=new Map(identityRows.map(row=>[row.feedback_id,row.user_id]));
    const report=buildMetricsOnlyReport((feedback??[]).map(item=>({...item,user_key:users.get(item.id)??item.id})));
    const {error:reportError}=await admin.from('feedback_weekly_reports').upsert({period_start:period.start.toISOString(),period_end:period.end.toISOString(),report_version:1,generated_summary:report.summary,structured_metrics:report.metrics,structured_insights:{categorySummaries:report.categorySummaries,limitations:report.limitations},status:'generated'},{onConflict:'period_start,period_end,report_version'});if(reportError)throw reportError;
    const {data:storedReport}=await admin.from('feedback_weekly_reports').select('id').eq('period_start',period.start.toISOString()).eq('period_end',period.end.toISOString()).eq('report_version',1).single();
    await admin.from('feedback_admin_alerts').insert({report_id:storedReport!.id,alert_type:'weekly-report',title:'Weekly product feedback insights are ready'});
    const {error:completeError}=await admin.from('feedback_engine_runs').update({status:'completed',completed_at:new Date().toISOString(),source_count:feedback?.length??0,output_report_id:storedReport!.id,error_details:null}).eq('id',runId);if(completeError)throw completeError;
    console.info(JSON.stringify({event:'feedback.engine_completed',runId,sourceCount:feedback?.length??0,categoryCount:report.categorySummaries.length}));return {id:runId,status:'completed',output_report_id:storedReport!.id};
  }catch(error){const message=error instanceof Error?error.message:'Unknown engine failure';await admin.from('feedback_engine_runs').update({status:'failed',completed_at:new Date().toISOString(),error_details:message.slice(0,2000)}).eq('id',runId);console.error(JSON.stringify({event:'feedback.engine_failed',runId,error:message.slice(0,300)}));throw error;}
}
