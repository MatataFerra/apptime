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
  experimental: {
    serverActions: {
      allowedOrigins: ["https://d33vz13z-3000.aue.devtunnels.ms/","localhost:3000"]
    }
  }
};

module.exports = withNextIntl(nextConfig);
