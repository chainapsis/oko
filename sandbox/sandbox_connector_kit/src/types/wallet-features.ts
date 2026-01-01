import type { WalletAccount } from "@wallet-standard/base";

/**
 * Wallet Standard Feature Types for Solana
 */

export interface SolanaSignMessageFeature {
  "solana:signMessage": {
    version: string;
    signMessage: (input: {
      account: WalletAccount;
      message: Uint8Array;
    }) => Promise<{ signature: Uint8Array; signedMessage: Uint8Array }[]>;
  };
}

export interface SolanaSignTransactionFeature {
  "solana:signTransaction": {
    version: string;
    signTransaction: (input: {
      account: WalletAccount;
      transaction: Uint8Array;
      chain?: string;
    }) => Promise<{ signedTransaction: Uint8Array }[]>;
  };
}

export interface SolanaSignAndSendTransactionFeature {
  "solana:signAndSendTransaction": {
    version: string;
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
}

export interface StandardConnectFeature {
  "standard:connect": {
    version: string;
    connect: (input?: { silent?: boolean }) => Promise<{
      accounts: readonly WalletAccount[];
    }>;
  };
}

export interface StandardDisconnectFeature {
  "standard:disconnect": {
    version: string;
    disconnect: () => Promise<void>;
  };
}

export type OkoWalletFeatures = SolanaSignMessageFeature &
  SolanaSignTransactionFeature &
  SolanaSignAndSendTransactionFeature &
  StandardConnectFeature &
  StandardDisconnectFeature;
