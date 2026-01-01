"use client";

import { useEffect, useState, useCallback } from "react";
import { OkoSolWallet } from "@oko-wallet/oko-sdk-sol";
import { registerOkoWallet } from "@oko-wallet/oko-connector-kit";
import { useWalletStore } from "@/store/wallet";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
} from "@/types/wallet-features";

export function useConnectorKit() {
  const {
    wallet,
    registration,
    isInitialized,
    isConnected,
    publicKey,
    setWallet,
    setRegistration,
    setInitialized,
    setConnected,
  } = useWalletStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and register Oko wallet
  useEffect(() => {
    if (isInitialized || isInitializing) return;

    const initWallet = async () => {
      setIsInitializing(true);
      setError(null);

      try {
        // 1. Initialize OkoSolWallet
        const initResult = OkoSolWallet.init({
          api_key: process.env.NEXT_PUBLIC_OKO_API_KEY!,
          sdk_endpoint: process.env.NEXT_PUBLIC_OKO_SDK_ENDPOINT,
        });

        if (!initResult.success) {
          throw new Error(
            `Failed to init OkoSolWallet: ${JSON.stringify(initResult.err)}`,
          );
        }

        const okoSolWallet = initResult.data;

        // Wait for initialization
        await okoSolWallet.waitUntilInitialized;

        // 2. Register with Wallet Standard via oko-connector-kit
        const reg = await registerOkoWallet(okoSolWallet, {
          defaultChain: "solana:devnet",
        });

        setRegistration(reg);
        setWallet(reg.wallet);
        setInitialized(true);

        console.log("[sandbox_connector_kit] Oko wallet registered");

        // Check if already connected (has accounts)
        if (reg.wallet.accounts.length > 0) {
          const pk = reg.wallet.accounts[0].address;
          setConnected(true, pk);
          console.log("[sandbox_connector_kit] Already connected:", pk);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error(
          "[sandbox_connector_kit] Failed to register wallet:",
          message,
        );
      } finally {
        setIsInitializing(false);
      }
    };

    initWallet();
  }, [
    isInitialized,
    isInitializing,
    setWallet,
    setRegistration,
    setInitialized,
    setConnected,
  ]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!wallet) {
      setError("Wallet not initialized");
      return;
    }

    try {
      setError(null);

      // Get connect feature
      const connectFeature = (
        wallet.features as unknown as StandardConnectFeature
      )["standard:connect"];
      if (!connectFeature) {
        throw new Error("Wallet does not support connect");
      }

      // Connect (triggers OAuth flow if needed)
      const result = await connectFeature.connect();

      if (result.accounts.length > 0) {
        const pk = result.accounts[0].address;
        setConnected(true, pk);
        console.log("[sandbox_connector_kit] Connected:", pk);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("[sandbox_connector_kit] Failed to connect:", message);
    }
  }, [wallet, setConnected]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (!wallet) return;

    try {
      // Get disconnect feature
      const disconnectFeature = (
        wallet.features as unknown as StandardDisconnectFeature
      )["standard:disconnect"];
      if (disconnectFeature) {
        await disconnectFeature.disconnect();
      }

      setConnected(false, null);
      console.log("[sandbox_connector_kit] Disconnected");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("[sandbox_connector_kit] Failed to disconnect:", message);
    }
  }, [wallet, setConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (registration) {
        registration.unregister();
        console.log("[sandbox_connector_kit] Wallet unregistered");
      }
    };
  }, [registration]);

  return {
    wallet,
    registration,
    isInitialized,
    isInitializing,
    isConnected,
    publicKey,
    error,
    connect,
    disconnect,
  };
}
