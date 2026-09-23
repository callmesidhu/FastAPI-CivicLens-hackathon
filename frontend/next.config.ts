import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: `${process.env.INTERNAL_BACKEND_URL || 'http://localhost:8000'}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
