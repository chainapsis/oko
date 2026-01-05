"use client";

import { useEffect, useState, useCallback } from "react";
import { OkoSolWallet, registerOkoWallet } from "@oko-wallet/oko-sdk-sol";
import { useSdkStore } from "@/store/sdk";

export function useOkoSol() {
  const {
    okoWallet,
    okoSolWallet,
    isInitialized,
    isConnected,
    publicKey,
    setOkoWallet,
    setOkoSolWallet,
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
        // Initialize OkoSolWallet (internally initializes OkoWallet)
        const solWalletResult = OkoSolWallet.init({
          api_key: process.env.NEXT_PUBLIC_OKO_API_KEY!,
          sdk_endpoint: process.env.NEXT_PUBLIC_OKO_SDK_ENDPOINT,
        });

        if (!solWalletResult.success) {
          throw new Error(
            `Failed to init OkoSolWallet: ${JSON.stringify(solWalletResult.err)}`,
          );
        }

        const solWallet = solWalletResult.data;
        setOkoSolWallet(solWallet);

        // Get the internal OkoWallet instance
        const wallet = solWallet.okoWallet;
        setOkoWallet(wallet);

        // Wait for initialization
        await solWallet.waitUntilInitialized;

        // Register with wallet-standard for dApp discovery
        registerOkoWallet(solWallet);
        console.log("[sandbox_sol] Oko wallet registered with wallet-standard");

        setInitialized(true);
        console.log("[sandbox_sol] SDK initialized");

        // Check for existing Ed25519 key (Solana uses Ed25519, not secp256k1)
        const existingEd25519Pubkey =
          await solWallet.okoWallet.getPublicKeyEd25519();
        if (existingEd25519Pubkey) {
          await solWallet.connect();
          const pk = solWallet.publicKey?.toBase58() ?? null;
          setConnected(true, pk);
          console.log("[sandbox_sol] Reconnected:", pk);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("[sandbox_sol] Failed to initialize SDK:", message);
      } finally {
        setIsInitializing(false);
      }
    };

    initSdk();
  }, [
    isInitialized,
    isInitializing,
    setOkoWallet,
    setOkoSolWallet,
    setInitialized,
    setConnected,
  ]);

  const connect = useCallback(async () => {
    if (!okoSolWallet) {
      setError("SDK not initialized");
      return;
    }

    try {
      setError(null);

      // Check if user is signed in
      const existingPubkey = await okoSolWallet.okoWallet.getPublicKey();
      if (!existingPubkey) {
        // Not signed in - open provider select modal
        await okoSolWallet.okoWallet.login();
      }

      // connect() internally handles Ed25519 key creation if needed
      await okoSolWallet.connect();
      const pk = okoSolWallet.publicKey?.toBase58() ?? null;
      setConnected(true, pk);
      console.log("[sandbox_sol] Connected:", pk);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("[sandbox_sol] Failed to connect:", message);
    }
  }, [okoSolWallet, setConnected]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (!okoSolWallet) return;

    try {
      await okoSolWallet.disconnect();
      setConnected(false, null);
      console.log("[sandbox_sol] Disconnected");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("[sandbox_sol] Failed to disconnect:", message);
    }
  }, [okoSolWallet, setConnected]);

  return {
    okoWallet,
    okoSolWallet,
    isInitialized,
    isInitializing,
    isConnected,
    publicKey,
    error,
    connect,
    disconnect,
  };
}
