/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Drops the X-Powered-By: Next.js response header -- no functional
  // change, just a byte of overhead and a version fingerprint removed.
  poweredByHeader: false,
};

module.exports = nextConfig;