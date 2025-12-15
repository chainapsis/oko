import type { Transaction, VersionedTransaction } from "@solana/web3.js";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

export async function signAllTransactions<T extends Transaction | VersionedTransaction>(
  this: OkoSolWalletInterface,
  _transactions: T[],
): Promise<T[]> {
  throw new Error("Not implemented");
}
