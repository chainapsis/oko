import type {
  Connection,
  SendOptions,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

import { SolanaRpcError, SolanaRpcErrorCode } from "./make_signature";
import { signTransaction } from "./sign_transaction";

export async function signAndSendTransaction(
  this: OkoSolWalletInterface,
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  options?: SendOptions,
): Promise<{ signature: TransactionSignature }> {
  if (!this.connected || !this.publicKey) {
    throw new SolanaRpcError(
      SolanaRpcErrorCode.Internal,
      "Wallet not connected",
    );
  }

  const signedTransaction = await signTransaction.call(this, transaction);

  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize(),
    options,
  );

  return { signature };
}
