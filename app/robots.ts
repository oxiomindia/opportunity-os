import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo/metadata';

/**
 * Auth-flow pages (login, signup, password reset, onboarding) are
 * deliberately NOT disallowed here -- Google's own guidance is to let those
 * be crawled so the page's `noindex` meta tag (see each page's own metadata)
 * is actually seen and honored, rather than blocking the crawl and risking
 * an "indexed, though blocked by robots.txt" result with no visible
 * directive. Everything that requires a real session is disallowed here.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/invoices/',
        '/bills/',
        '/customers/',
        '/products/',
        '/vendors/',
        '/reports/',
        '/settings/',
        '/feedback/',
        '/activity/',
        '/itc-recovery/',
        '/control-center/',
        '/admin/',
        '/upload/',
        '/verification/',
        '/reviews/',
        '/accounts-review/',
        '/payment-queue/',
        '/organization-required/',
        '/onboarding/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
