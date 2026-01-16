import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oko-wallet.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // Rita: it should be removed after modularChainInfo changes in Wallet packages
  },
};

export default nextConfig;
