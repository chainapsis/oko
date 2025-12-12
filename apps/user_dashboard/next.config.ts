import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Rita: it should be removed after modularChainInfo changes in Wallet packages
  },
};

export default nextConfig;
