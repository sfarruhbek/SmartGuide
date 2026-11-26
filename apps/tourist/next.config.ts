import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@smartguide/shared'],
  async rewrites() {
    const origin = (process.env.SMARTGUIDE_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000').replace(/\/+$/, '');
    return [{ source: '/api/:path*', destination: `${origin}/api/:path*` }];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
