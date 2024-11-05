import type { NextConfig } from 'next';

const COMPONENTS_API_URL = 'http://dev5.conwayandpartners.com:1340';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/assetsApi/:path*',
        destination: COMPONENTS_API_URL + '/:path*',
      },
    ];
  },
};

export default nextConfig;
