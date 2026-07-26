import { z } from 'zod';

export const weeklyOutputSchema = z.object({
  summary: z.string().max(4000),
  metrics: z.object({ total: z.number().int().nonnegative(), organizations: z.number().int().nonnegative(), urgent: z.number().int().nonnegative(), praise: z.number().int().nonnegative(), improvements: z.number().int().nonnegative() }),
  categorySummaries: z.array(z.object({ category: z.string().max(100), label: z.string().max(160), sourceIds: z.array(z.uuid()).max(500), submissionCount: z.number().int().positive(), userCount: z.number().int().positive(), organizationCount: z.number().int().positive(), suggestedPriority: z.enum(['unassigned', 'low', 'medium', 'high', 'critical']), recommendedAction: z.enum(['investigate-immediately', 'current-sprint', 'later-release', 'request-information', 'monitor', 'no-action']) })).max(100),
  limitations: z.string().max(1000),
});

function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23' }).formatToParts(date);
  const value=(type:string)=>parts.find(part=>part.type===type)!.value;
  return {year:Number(value('year')),month:Number(value('month')),day:Number(value('day')),hour:Number(value('hour')),minute:Number(value('minute')),second:Number(value('second')),weekday:value('weekday')};
}
function localMidnightUtc(year:number,month:number,day:number,timeZone:string){const desired=Date.UTC(year,month-1,day);let result=new Date(desired);for(let attempt=0;attempt<3;attempt++){const rendered=localParts(result,timeZone);const renderedUtc=Date.UTC(rendered.year,rendered.month-1,rendered.day,rendered.hour,rendered.minute,rendered.second);const correction=desired-renderedUtc;if(!correction)break;result=new Date(result.getTime()+correction);}return result;}
export function previousReportingPeriod(now: Date, timeZone='UTC') {
  const local=localParts(now,timeZone);const weekdayIndex=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(local.weekday);
  const localDay=new Date(Date.UTC(local.year,local.month-1,local.day));localDay.setUTCDate(localDay.getUTCDate()-weekdayIndex);
  const end=localMidnightUtc(localDay.getUTCFullYear(),localDay.getUTCMonth()+1,localDay.getUTCDate(),timeZone);
  localDay.setUTCDate(localDay.getUTCDate()-7);const start=localMidnightUtc(localDay.getUTCFullYear(),localDay.getUTCMonth()+1,localDay.getUTCDate(),timeZone);
  return { start, end };
}
export function weeklyRunKey(start:Date,end:Date,version=1){return `weekly:${start.toISOString()}:${end.toISOString()}:v${version}`;}

interface Source { id: string; organization_id: string; user_key: string; pros: string | null; cons: string | null; category: string; urgent_review: boolean; engine_suggested_priority: string }
export function buildMetricsOnlyReport(sources: Source[]) {
  const grouped = new Map<string, Source[]>();
  sources.forEach((source) => grouped.set(source.category, [...(grouped.get(source.category) ?? []), source]));
  const categorySummaries = Array.from(grouped.entries()).map(([category, items]) => {
    const urgent = items.some((item) => item.urgent_review);
    return { category, label: category.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '), sourceIds: items.map((item) => item.id), submissionCount: items.length, userCount: new Set(items.map((item) => item.user_key)).size, organizationCount: new Set(items.map((item) => item.organization_id)).size, suggestedPriority: urgent ? 'high' as const : 'unassigned' as const, recommendedAction: urgent ? 'investigate-immediately' as const : 'monitor' as const };
  });
  return weeklyOutputSchema.parse({
    summary: `Metrics-only report covering ${sources.length} feedback submission${sources.length === 1 ? '' : 's'}.`,
    metrics: { total: sources.length, organizations: new Set(sources.map((source) => source.organization_id)).size, urgent: sources.filter((source) => source.urgent_review).length, praise: sources.filter((source) => Boolean(source.pros)).length, improvements: sources.filter((source) => Boolean(source.cons)).length },
    categorySummaries, limitations: 'No AI provider was used. Summaries are deterministic category aggregates and require human review.',
  });
}
