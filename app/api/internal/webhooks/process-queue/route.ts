import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import '../../../../../lib/webhooks/bootstrap';
import { processRetryQueue } from '../../../../../lib/webhooks/delivery';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Same CRON_SECRET-bearer-token pattern as
// app/api/internal/feedback/weekly/route.ts -- reused, not reinvented.
function authorized(request: Request): boolean {
  const configured = process.env.WEBHOOK_CRON_SECRET ?? process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/, '');
  if (!configured || !supplied) return false;
  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const attempts = await processRetryQueue();
    return NextResponse.json({ ok: true, data: { processed: attempts.length } });
  } catch (error) {
    console.error('Webhook retry queue processing failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ ok: false, error: 'Retry queue processing failed.' }, { status: 500 });
  }
}

export const GET = POST;
