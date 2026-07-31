import { NextResponse } from 'next/server';
import { absoluteUrl } from '../../../../../lib/seo/metadata';
import { recordClick } from '../../../../../lib/growth/tracking';

interface RouteParams {
  params: Promise<{ opportunityId: string }>;
}

/**
 * Real, working click tracking: records a ClickEvent, then redirects to
 * the requested Oxiom page. `path` must be a site-relative path (not an
 * absolute URL) -- this can never be used as an open redirect to an
 * external destination, unlike a design that accepted a full URL.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { opportunityId } = await params;
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  const campaign = url.searchParams.get('campaign') ?? 'unspecified';
  const medium = url.searchParams.get('medium') ?? 'social';

  if (!path || !path.startsWith('/')) {
    return new Response('A site-relative "path" query parameter is required.', { status: 400 });
  }

  const destinationUrl = absoluteUrl(path);
  recordClick({
    destinationUrl,
    utmSource: 'oxiom-growth',
    utmMedium: medium,
    utmCampaign: campaign,
    opportunityId,
  });

  return NextResponse.redirect(destinationUrl, { status: 302 });
}
