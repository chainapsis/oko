import type { Transaction, VersionedTransaction } from "@solana/web3.js";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

export async function signTransaction<T extends Transaction | VersionedTransaction>(
  this: OkoSolWalletInterface,
  _transaction: T,
): Promise<T> {
  throw new Error("Not implemented");
}
