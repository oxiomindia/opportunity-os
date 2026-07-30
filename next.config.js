/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Drops the X-Powered-By: Next.js response header -- no functional
  // change, just a byte of overhead and a version fingerprint removed.
  poweredByHeader: false,
  // Admin Platform Consolidation: Feedback administration moved from its own
  // /admin shell into Control Center. These keep any bookmarked/linked old
  // URLs working rather than breaking them outright.
  async redirects() {
    return [
      { source: '/admin/feedback', destination: '/control-center/feedback', permanent: true },
      { source: '/admin/feedback/inbox', destination: '/control-center/feedback/inbox', permanent: true },
      { source: '/admin/feedback/urgent', destination: '/control-center/feedback/urgent', permanent: true },
      { source: '/admin/feedback/reports', destination: '/control-center/feedback/reports', permanent: true },
      { source: '/admin/feedback/:id', destination: '/control-center/feedback/:id', permanent: true },
    ];
  },
};

module.exports = nextConfig;