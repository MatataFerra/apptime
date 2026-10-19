const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');
const withBundleAnalyzer = require('@next/bundle-analyzer')()


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  },
  // VS Code dev tunnels (e.g. d33vz13z-3000.aue.devtunnels.ms). Hosts only:
  // no scheme, no trailing slash. The app's own origin is always allowed.
  allowedDevOrigins: ["*.aue.devtunnels.ms"],
  experimental: {
    // Server Actions are stable; their options still live under `experimental`.
    serverActions: {
      allowedOrigins: ["*.aue.devtunnels.ms"],
    },
  },
};

module.exports = 
  process.env.ANALYZE === 'true' 
    ? withBundleAnalyzer(withNextIntl(nextConfig)) 
    : withNextIntl(nextConfig);
