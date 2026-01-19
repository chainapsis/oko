"use client";

import { type ReactNode, useEffect, useState } from "react";
import { FrostProvider } from "@rialo/frost";
import { OkoSolWallet, type WalletStandardConfig } from "@oko-wallet/oko-sdk-svm";
import type { IdentifierString } from "@wallet-standard/base";
import {
  RIALO_CHAINS,
  RIALO_DEVNET_CHAIN,
  RIALO_TESTNET_CHAIN,
  RIALO_LOCALNET_CHAIN,
  RialoSignMessage,
  RialoSignTransaction,
  RialoSignAndSendTransaction,
} from "@rialo/wallet-standard";
import { frostConfig } from "@/lib/frost-config";

const RIALO_CONFIG: WalletStandardConfig = {
  chains: RIALO_CHAINS,
  features: {
    signIn: "rialo:signIn" as IdentifierString,
    signMessage: RialoSignMessage,
    signTransaction: RialoSignTransaction,
    signAndSendTransaction: RialoSignAndSendTransaction,
  },
  rpcEndpoints: {
    [RIALO_DEVNET_CHAIN]: "https://api.devnet.rialo.io",
    [RIALO_TESTNET_CHAIN]: "https://api.testnet.rialo.io",
    [RIALO_LOCALNET_CHAIN]: "http://localhost:8899",
  },
};

export function Providers({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initWallet = async () => {
      try {
        const result = OkoSolWallet.init({
          api_key: process.env.NEXT_PUBLIC_OKO_API_KEY!,
          sdk_endpoint: process.env.NEXT_PUBLIC_OKO_SDK_ENDPOINT,
          walletStandard: RIALO_CONFIG,
        });

        if (!result.success) {
          throw new Error(`Failed to initialize: ${JSON.stringify(result.err)}`);
        }

        await result.data.waitUntilInitialized;
        console.log("[sandbox_rialo] Oko wallet initialized");
      } catch (err) {
        console.error("[sandbox_rialo] Failed to initialize Oko wallet:", err);
      }
      setIsReady(true);
    };

    initWallet();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Initializing wallet...</div>
      </div>
    );
  }

  return <FrostProvider config={frostConfig}>{children}</FrostProvider>;
}
