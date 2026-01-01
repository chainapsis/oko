/**
 * Oko Wallet Registration Helper
 *
 * Registers the Oko wallet into the Wallet Standard registry,
 * making it available to ConnectorKit's wallet detection system.
 */

import { getWallets } from "@wallet-standard/app";
import type { OkoWalletConfig, OkoWalletRegistration, OkoSolWalletLike } from "./types";
import { createOkoWallet } from "./create-oko-wallet";

/**
 * Register Oko wallet into the Wallet Standard registry
 *
 * This function:
 * 1. Initializes OkoSolWallet with the provided config
 * 2. Creates a Wallet Standard-compatible wallet wrapper
 * 3. Registers the wallet with the Wallet Standard registry
 *
 * The wallet will appear in ConnectorKit's wallet list as "Oko"
 * and can be selected like any other wallet.
 *
 * @param config - Oko wallet configuration
 * @returns Registration result with wallet and unregister function
 *
 * @example
 * ```typescript
 * import { registerOkoWallet } from '@oko-wallet/oko-connector-kit';
 *
 * const { wallet, unregister, okoWallet } = await registerOkoWallet({
 *   apiKey: 'your-api-key',
 *   defaultChain: 'solana:mainnet',
 * });
 *
 * // Later, to remove from registry:
 * unregister();
 * ```
 */
export async function registerOkoWallet(
  okoSolWallet: OkoSolWalletLike,
  config: OkoWalletConfig
): Promise<OkoWalletRegistration> {
  if (typeof window === "undefined") {
    throw new Error(
      "Oko wallet registration can only be done in a browser environment"
    );
  }

  // 1. Create Wallet Standard wrapper
  const wallet = createOkoWallet(okoSolWallet, config);

  // 2. Register with Wallet Standard registry
  const wallets = getWallets();
  const unregister = wallets.register(wallet);

  console.log("[oko-connector-kit] Oko wallet registered successfully");

  return {
    wallet,
    unregister,
    okoWallet: okoSolWallet,
  };
}

/**
 * Check if running in browser environment
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined";
}
