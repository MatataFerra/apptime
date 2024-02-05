const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'placehold.co',
      port: '',
      pathname: '/100x100/**',
    }],
    dangerouslyAllowSVG: true,
  },
};

module.exports = withNextIntl(nextConfig);
