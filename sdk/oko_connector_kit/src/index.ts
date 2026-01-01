/**
 * @oko-wallet/oko-connector-kit
 *
 * Wallet Standard adapter for Oko MPC wallet.
 * Enables Oko wallet to be used with ConnectorKit and other
 * Wallet Standard compatible applications.
 *
 * @example
 * ```typescript
 * import { registerOkoWallet } from '@oko-wallet/oko-connector-kit';
 *
 * const { wallet, unregister } = await registerOkoWallet({
 *   apiKey: 'your-api-key',
 *   defaultChain: 'solana:mainnet',
 * });
 *
 * // Oko wallet is now available in ConnectorKit
 * ```
 */

// Main registration functions
export { registerOkoWallet, isBrowserEnvironment } from "./register-oko";

// Wallet creation (for advanced usage)
export { createOkoWallet } from "./create-oko-wallet";

// Types
export type {
  OkoWalletConfig,
  OkoWalletRegistration,
  OkoSolWalletLike,
  SolanaChain,
  WalletIcon,
  OkoWalletFeatures,
} from "./types";

// Utilities
export {
  OKO_DEFAULT_ICON,
  SUPPORTED_CHAINS,
  CHAIN_RPC_ENDPOINTS,
  deserializeTransaction,
  serializeTransaction,
  createWalletAccount,
  getConnectionForChain,
} from "./utils";
