import Link from 'next/link';
import { requirePlatformAdmin } from '../../../../lib/feedback/admin';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

interface StoredReport {
  id: string; period_start: string; period_end: string; generated_summary: string;
  structured_metrics: Record<string, unknown>; structured_insights: Record<string, unknown>;
  status: string; generated_at: string;
}

function sourceIds(insights: Record<string, unknown>) {
  const groups = (insights.categorySummaries ?? insights.themes) as { sourceIds?: string[] }[] | undefined;
  return Array.from(new Set((groups ?? []).flatMap((group) => group.sourceIds ?? [])));
}

export default async function Reports() {
  await requirePlatformAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('feedback_weekly_reports').select('id,period_start,period_end,generated_summary,structured_metrics,structured_insights,status,generated_at').order('period_start',{ascending:false}).limit(20);
  const reports = (data ?? []) as StoredReport[];
  return <div className="space-y-5"><header><h1 className="text-2xl font-semibold">Weekly insights</h1><p className="mt-2 text-sm text-slate-600">Traceable, human-reviewed summaries of product feedback.</p></header>{!reports.length?<p className="rounded border bg-white p-5 text-sm text-slate-500">No weekly report has been generated yet.</p>:reports.map((report)=>{const sources=sourceIds(report.structured_insights);return <article key={report.id} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex justify-between"><h2 className="font-semibold">{new Date(report.period_start).toLocaleDateString()} – {new Date(report.period_end).toLocaleDateString()}</h2><span className="text-xs uppercase text-slate-500">{report.status}</span></div><p className="mt-3 text-sm text-slate-700">{report.generated_summary}</p><pre className="mt-4 overflow-auto rounded bg-slate-50 p-3 text-xs">{JSON.stringify(report.structured_insights,null,2)}</pre>{sources.length>0&&<div className="mt-4 flex flex-wrap gap-2" aria-label="Source feedback">{sources.map((id)=><Link key={id} href={`/admin/feedback/${id}`} className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-blue-700">Source {id.slice(0,8)}</Link>)}</div>}</article>})}</div>;
}
