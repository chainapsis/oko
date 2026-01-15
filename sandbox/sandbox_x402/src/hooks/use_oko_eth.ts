"use client";

import { useEffect, useState, useCallback } from "react";
import { OkoEthWallet } from "@oko-wallet/oko-sdk-eth";
import { useSdkStore } from "@/store/sdk";

export function useOkoEth() {
  const {
    okoWallet,
    okoEthWallet,
    isInitialized,
    isConnected,
    address,
    setOkoWallet,
    setOkoEthWallet,
    setInitialized,
    setConnected,
  } = useSdkStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK
  useEffect(() => {
    if (isInitialized || isInitializing) return;

    const initSdk = async () => {
      setIsInitializing(true);
      setError(null);

      try {
        // Initialize OkoEthWallet (internally initializes OkoWallet)
        const ethWalletResult = OkoEthWallet.init({
          api_key: process.env.NEXT_PUBLIC_OKO_API_KEY!,
          sdk_endpoint: process.env.NEXT_PUBLIC_OKO_SDK_ENDPOINT,
        });

        if (!ethWalletResult.success) {
          throw new Error(
            `Failed to init OkoEthWallet: ${JSON.stringify(ethWalletResult.err)}`,
          );
        }

        const ethWallet = ethWalletResult.data;
        setOkoEthWallet(ethWallet);

        // Get the internal OkoWallet instance
        const wallet = ethWallet.okoWallet;
        setOkoWallet(wallet);

        // Wait for initialization
        await ethWallet.waitUntilInitialized;

        setInitialized(true);
        console.log("[sandbox_x402] SDK initialized");

        // Check for existing public key
        const existingPubkey = await wallet.getPublicKey();
        if (existingPubkey) {
          const addr = await ethWallet.getAddress();
          setConnected(true, addr);
          console.log("[sandbox_x402] Reconnected:", addr);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("[sandbox_x402] Failed to initialize SDK:", message);
      } finally {
        setIsInitializing(false);
      }
    };

    initSdk();
  }, [
    isInitialized,
    isInitializing,
    setOkoWallet,
    setOkoEthWallet,
    setInitialized,
    setConnected,
  ]);

  const connect = useCallback(async () => {
    if (!okoEthWallet) {
      setError("SDK not initialized");
      return;
    }

    try {
      setError(null);

      // Check if user is signed in
      const existingPubkey = await okoEthWallet.okoWallet.getPublicKey();
      if (!existingPubkey) {
        // Not signed in - trigger OAuth sign in
        await okoEthWallet.okoWallet.signIn("google");
      }

      // Get address
      const addr = await okoEthWallet.getAddress();
      setConnected(true, addr);
      console.log("[sandbox_x402] Connected:", addr);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("[sandbox_x402] Failed to connect:", message);
    }
  }, [okoEthWallet, setConnected]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (!okoWallet) return;

    try {
      await okoWallet.signOut();
      setConnected(false, null);
      console.log("[sandbox_x402] Disconnected");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("[sandbox_x402] Failed to disconnect:", message);
    }
  }, [okoWallet, setConnected]);

  return {
    okoWallet,
    okoEthWallet,
    isInitialized,
    isInitializing,
    isConnected,
    address,
    error,
    connect,
    disconnect,
  };
}
