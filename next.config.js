const withNextIntl = require('next-intl/plugin')();
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
  experimental: {
    serverActions: {
      allowedOrigins: ["https://d33vz13z-3000.aue.devtunnels.ms/","localhost:3000"]
    }
  }
};

module.exports = 
  process.env.ANALYZE === 'true' 
    ? withBundleAnalyzer(withNextIntl(nextConfig)) 
    : withNextIntl(nextConfig);
