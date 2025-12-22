import type {
  OkoWalletInitArgs,
  OkoWalletInterface,
} from "@oko-wallet/oko-sdk-core";
import type {
  Connection,
  PublicKey,
  SendOptions,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  OkoSolWalletInitError,
  LazyInitError,
} from "@oko-wallet-sdk-sol/errors";

export interface OkoSolWalletState {
  publicKey: PublicKey | null;
  publicKeyRaw: string | null;
}

export type OkoSolWalletInitArgs = OkoWalletInitArgs;

export interface OkoSolWalletStaticInterface {
  new (okoWallet: OkoWalletInterface): void;
  init: (
    args: OkoSolWalletInitArgs,
  ) => Result<OkoSolWalletInterface, OkoSolWalletInitError>;
}

export interface OkoSolWalletInterface {
  // oko 패턴 속성
  state: OkoSolWalletState;
  okoWallet: OkoWalletInterface;
  waitUntilInitialized: Promise<Result<OkoSolWalletState, LazyInitError>>;

  // Solana Wallet Adapter 표준 속성
  publicKey: PublicKey | null;
  connecting: boolean;
  connected: boolean;

  // Solana Wallet Adapter 표준 메서드
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T,
  ) => Promise<T>;
  signAllTransactions: <T extends Transaction | VersionedTransaction>(
    transactions: T[],
  ) => Promise<T[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendOptions,
  ) => Promise<TransactionSignature>;
}
