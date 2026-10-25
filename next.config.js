const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');
const withBundleAnalyzer = require('@next/bundle-analyzer')()

const isDev = process.env.NODE_ENV === 'development'

/**
 * Sent with every response. No script-src CSP yet (the theme script is
 * inline and would need nonces); these directives don't affect scripts.
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
  // Older browsers that don't read frame-ancestors.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Automatic memoization. Components that break the rules of React are
  // skipped by the compiler; eslint (react-hooks) reports them as errors.
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com',
      port: '',
    }],
    dangerouslyAllowSVG: true,
    // An optimized SVG can carry scripts: download it instead of rendering
    // it as a page, and never let it run them (Next's recommended setting).
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  // VS Code dev tunnels (e.g. d33vz13z-3000.aue.devtunnels.ms). Hosts only:
  // no scheme, no trailing slash. The app's own origin is always allowed.
  allowedDevOrigins: ["*.aue.devtunnels.ms"],
  experimental: {
    // Keep visited pages in the client router cache for 30 s (default 0), so
    // going back to one doesn't wait for the server. Safe here: the pages
    // under (home) are shells and their data lives in React Query; logging
    // out is a full page load, which empties this cache.
    staleTimes: { dynamic: 30 },
    // Only in development: in production any *.aue.devtunnels.ms page (anyone
    // can open one) could call the server actions.
    // Server Actions are stable; their options still live under `experimental`.
    ...(isDev && {
      serverActions: {
        allowedOrigins: ["*.aue.devtunnels.ms"],
      },
    }),
  },
};

module.exports = 
  process.env.ANALYZE === 'true' 
    ? withBundleAnalyzer(withNextIntl(nextConfig)) 
    : withNextIntl(nextConfig);
