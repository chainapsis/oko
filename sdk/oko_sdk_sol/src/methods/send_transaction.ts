import type {
  Connection,
  SendOptions,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

export async function sendTransaction(
  this: OkoSolWalletInterface,
  _transaction: Transaction | VersionedTransaction,
  _connection: Connection,
  _options?: SendOptions,
): Promise<TransactionSignature> {
  throw new Error("Not implemented");
}
