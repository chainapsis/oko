import type { Transaction, VersionedTransaction } from "@solana/web3.js";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";
import {
  makeSignature,
  SolanaRpcError,
  SolanaRpcErrorCode,
} from "./make_signature";

export async function signAllTransactions<
  T extends Transaction | VersionedTransaction,
>(this: OkoSolWalletInterface, transactions: T[]): Promise<T[]> {
  if (!this.connected || !this.publicKey) {
    throw new SolanaRpcError(
      SolanaRpcErrorCode.Internal,
      "Wallet not connected",
    );
  }

  const result = await makeSignature.call(this, {
    type: "sign_all_transactions",
    transactions,
  });

  if (result.type !== "sign_all_transactions") {
    throw new SolanaRpcError(
      SolanaRpcErrorCode.Internal,
      "Unexpected result type",
    );
  }

  return result.signedTransactions as T[];
}
