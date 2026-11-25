import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@smartguide/shared'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
