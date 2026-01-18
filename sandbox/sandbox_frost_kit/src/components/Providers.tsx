"use client";

import { type ReactNode, useEffect, useState } from "react";
import { FrostProvider } from "@rialo/frost";
import { initOkoFrostWallet } from "@oko-wallet/oko-frost-kit";
import { frostConfig } from "@/lib/frost-config";

export function Providers({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initOkoFrostWallet({
      api_key: process.env.NEXT_PUBLIC_OKO_API_KEY!,
      sdk_endpoint: process.env.NEXT_PUBLIC_OKO_SDK_ENDPOINT,
    })
      .then(() => {
        console.log("[sandbox_frost_kit] Oko wallet initialized");
        setIsReady(true);
      })
      .catch((err) => {
        console.error("[sandbox_frost_kit] Failed to initialize Oko wallet:", err);
        setIsReady(true); // Still render the app even if wallet init fails
      });
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
