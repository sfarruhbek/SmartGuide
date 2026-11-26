import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@smartguide/shared'],
  async rewrites() {
    const origin = (process.env.SMARTGUIDE_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000').replace(/\/+$/, '');
    return [{ source: '/api/:path*', destination: `${origin}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/manifest.webmanifest',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
