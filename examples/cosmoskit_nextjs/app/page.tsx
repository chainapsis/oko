"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChainProvider } from "@cosmos-kit/react";
import { makeOkoWallets } from "@oko-wallet/oko-cosmos-kit";
import { chains, assets } from "chain-registry";
import App from "@/components/App";
import "@interchain-ui/react/styles";

const queryClient = new QueryClient();

export default function Home() {
  const okoWallets = makeOkoWallets({
    apiKey: process.env.NEXT_PUBLIC_OKO_API_KEY!,
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ChainProvider
        chains={chains}
        assetLists={assets}
        wallets={[...okoWallets]}
        throwErrors={false}
      >
        <App />
      </ChainProvider>
    </QueryClientProvider>
  );
}
