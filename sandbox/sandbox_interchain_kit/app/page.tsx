"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChainProvider, InterchainWalletModal } from "@interchain-kit/react";
import { chains, assetLists } from "@chain-registry/v2";
import App from "@/components/App";
import { okoWallet } from "@oko-wallet/oko-interchain-kit";
import "@interchain-kit/react/styles.css";

const queryClient = new QueryClient();

// Filter chains to only include osmosis for testing
const filteredChains = chains.filter((chain) => chain.chainName === "osmosis");
const filteredAssetLists = assetLists.filter(
  (assetList) => assetList.chainName === "osmosis"
);

console.log("[page] Filtered chains:", filteredChains.map((c) => c.chainName));

// Oko Wallet configuration
let oko: any = null;

if (typeof window !== "undefined") {
  try {
    oko = okoWallet({
      apiKey: process.env.NEXT_PUBLIC_OKO_API_KEY || "",
      sdkEndpoint: process.env.NEXT_PUBLIC_OKO_SDK_ENDPOINT,
      loginProvider: "google",
    });
    console.log("[page] Oko wallet initialized");
  } catch (error) {
    console.error("[page] Failed to initialize Oko wallet:", error);
  }
}

const wallets = oko ? [oko] : [];

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChainProvider
        chains={filteredChains}
        assetLists={filteredAssetLists}
        wallets={wallets}
        walletModal={() => <InterchainWalletModal />}
      >
        <App />
      </ChainProvider>
    </QueryClientProvider>
  );
}
