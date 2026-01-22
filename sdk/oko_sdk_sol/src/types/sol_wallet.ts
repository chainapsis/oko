import type {
  OkoWalletInitArgs,
  OkoWalletInterface,
} from "@oko-wallet/oko-sdk-core";
import type { WalletStandardConfig } from "@oko-wallet-sdk-sol/wallet-standard";
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
import type { SolWalletEvent, SolWalletEventHandler } from "./event";

export interface OkoSolWalletState {
  publicKey: PublicKey | null;
  publicKeyRaw: string | null;
}

export type OkoSolWalletInitArgs = OkoWalletInitArgs & {
  wallet_standard?: WalletStandardConfig[];
};

export interface OkoSolWalletStaticInterface {
  new (okoWallet: OkoWalletInterface): void;
  init: (
    args: OkoSolWalletInitArgs,
  ) => Result<OkoSolWalletInterface, OkoSolWalletInitError>;
}

export interface OkoSolWalletInterface {
  state: OkoSolWalletState;
  okoWallet: OkoWalletInterface;
  waitUntilInitialized: Promise<Result<OkoSolWalletState, LazyInitError>>;

  publicKey: PublicKey | null;
  connecting: boolean;
  connected: boolean;

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

  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendOptions,
  ) => Promise<{ signature: TransactionSignature }>;
  signAndSendAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[],
    connection: Connection,
    options?: SendOptions,
  ) => Promise<{ signatures: TransactionSignature[] }>;

  on: <K extends SolWalletEvent>(
    event: K,
    handler: SolWalletEventHandler<K>,
  ) => void;
  off: <K extends SolWalletEvent>(
    event: K,
    handler: SolWalletEventHandler<K>,
  ) => void;
}
