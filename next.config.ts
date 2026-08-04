import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  experimental: {
    cpus: 1,
    serverActions: {
      bodySizeLimit: "2mb"
    }
  }
};

export default nextConfig;
