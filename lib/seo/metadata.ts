import type { Metadata } from 'next';

export const SITE_URL = 'https://oxiom.in';
export const SITE_NAME = 'Oxiom';
export const SITE_LOCALE = 'en-IN';

export function absoluteUrl(path: string): string {
  if (path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export interface PageMetadataInput {
  path: string;
  title: string;
  description: string;
}

/**
 * Single source of truth for public-page metadata: canonical, hreflang,
 * OpenGraph, and Twitter all derive from the same title/description/path a
 * page already provides, so a page only needs to state its content once.
 */
export function buildMetadata({ path, title, description }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  // The root opengraph-image/twitter-image file convention only auto-attaches
  // to the exact "/" segment, not to every nested route, so every page
  // explicitly points at that one shared generated image instead of each
  // route needing (and building) its own image-generation route.
  const ogImage = { url: absoluteUrl('/opengraph-image'), width: 1200, height: 630, alt: title };
  const twitterImage = { url: absoluteUrl('/twitter-image'), width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { [SITE_LOCALE]: url },
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [twitterImage.url],
    },
  };
}

/** For pages that must never be indexed (auth flows, the authenticated workspace). */
export const NOINDEX: Metadata['robots'] = { index: false, follow: false };
