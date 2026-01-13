import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://zl0pbu4u85.execute-api.us-east-1.amazonaws.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;