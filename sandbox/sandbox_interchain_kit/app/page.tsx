"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChainProvider, InterchainWalletModal } from "@interchain-kit/react";
import { chains, assetLists } from "@chain-registry/v2";
import App from "@/components/App";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import "@interchain-kit/react/styles.css";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChainProvider
        chains={chains}
        assetLists={assetLists}
        wallets={[keplrWallet]}
        walletModal={() => <InterchainWalletModal />}
      >
        <App />
      </ChainProvider>
    </QueryClientProvider>
  );
}
