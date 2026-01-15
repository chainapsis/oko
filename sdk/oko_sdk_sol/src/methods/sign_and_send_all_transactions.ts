import type {
  Connection,
  SendOptions,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

import { SolanaRpcError, SolanaRpcErrorCode } from "./make_signature";
import { signAllTransactions } from "./sign_all_transactions";

export async function signAndSendAllTransactions(
  this: OkoSolWalletInterface,
  transactions: (Transaction | VersionedTransaction)[],
  connection: Connection,
  options?: SendOptions,
): Promise<{ signatures: TransactionSignature[] }> {
  if (!this.connected || !this.publicKey) {
    throw new SolanaRpcError(
      SolanaRpcErrorCode.Internal,
      "Wallet not connected",
    );
  }

  const signedTransactions = await signAllTransactions.call(this, transactions);

  const signatures: TransactionSignature[] = [];

  for (const signedTx of signedTransactions) {
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      options,
    );
    signatures.push(signature);
  }

  return { signatures };
}
