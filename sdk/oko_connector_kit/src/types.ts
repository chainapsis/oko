import type { Wallet, WalletAccount } from "@wallet-standard/base";
import type {
  PublicKey,
  Transaction,
  VersionedTransaction,
  Connection,
  SendOptions,
  TransactionSignature,
} from "@solana/web3.js";

/**
 * Minimal interface for OkoSolWallet
 * This is a subset of the full interface to avoid direct dependency
 */
export interface OkoSolWalletLike {
  publicKey: PublicKey | null;
  connecting: boolean;
  connected: boolean;
  waitUntilInitialized: Promise<unknown>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T
  ) => Promise<T>;
  signAllTransactions: <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ) => Promise<T[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendOptions
  ) => Promise<TransactionSignature>;
}

/**
 * Configuration for registering Oko wallet with Wallet Standard
 */
export interface OkoWalletConfig {
  /** API key for Oko service */
  apiKey: string;

  /** Optional custom SDK endpoint */
  sdkEndpoint?: string;

  /** Default Solana chain */
  defaultChain?: SolanaChain;

  /** Wallet display name (default: 'Oko') */
  name?: string;

  /** Wallet icon as data URI or URL */
  icon?: WalletIcon;

  /** RPC endpoint for signAndSendTransaction */
  rpcEndpoint?: string;
}

/**
 * Result of registering Oko wallet
 */
export interface OkoWalletRegistration {
  /** The registered Wallet Standard wallet */
  wallet: Wallet;

  /** Function to unregister from the wallet registry */
  unregister: () => void;

  /** The underlying OkoSolWallet instance for direct access */
  okoWallet: OkoSolWalletLike;
}

/**
 * Supported Solana chains
 */
export type SolanaChain =
  | "solana:mainnet"
  | "solana:devnet"
  | "solana:testnet"
  | "solana:localnet";

/**
 * Wallet icon type (data URI)
 */
export type WalletIcon = `data:image/${"svg+xml" | "webp" | "png" | "gif"};base64,${string}`;

/**
 * Wallet Standard features supported by Oko
 */
export interface OkoWalletFeatures {
  "standard:connect": {
    version: "1.0.0";
    connect: (input?: { silent?: boolean }) => Promise<{ accounts: readonly WalletAccount[] }>;
  };
  "standard:disconnect": {
    version: "1.0.0";
    disconnect: () => Promise<void>;
  };
  "standard:events": {
    version: "1.0.0";
    on: (
      event: "change",
      listener: (props: { accounts?: readonly WalletAccount[] }) => void
    ) => () => void;
  };
  "solana:signTransaction": {
    version: "1.0.0";
    signTransaction: (input: {
      account: WalletAccount;
      transaction: Uint8Array;
      chain?: string;
    }) => Promise<{ signedTransaction: Uint8Array }[]>;
  };
  "solana:signAndSendTransaction": {
    version: "1.0.0";
    signAndSendTransaction: (input: {
      account: WalletAccount;
      transaction: Uint8Array;
      chain?: string;
      options?: {
        skipPreflight?: boolean;
        maxRetries?: number;
      };
    }) => Promise<{ signature: Uint8Array }[]>;
  };
  "solana:signAllTransactions": {
    version: "1.0.0";
    signAllTransactions: (input: {
      account: WalletAccount;
      transactions: Uint8Array[];
      chain?: string;
    }) => Promise<{ signedTransaction: Uint8Array }[]>;
  };
  "solana:signMessage": {
    version: "1.0.0";
    signMessage: (input: {
      account: WalletAccount;
      message: Uint8Array;
    }) => Promise<{ signature: Uint8Array; signedMessage: Uint8Array }[]>;
  };
}
