import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [100, 75],
  },
  typescript: {
    ignoreBuildErrors: true, // Rita: it should be removed after modularChainInfo changes in Wallet packages
  },
};

export default nextConfig;
