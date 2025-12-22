import type {
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

export type SolSignTransactionParams = {
  type: "sign_transaction";
  transaction: Transaction | VersionedTransaction;
};

export type SolSignAllTransactionsParams = {
  type: "sign_all_transactions";
  transactions: (Transaction | VersionedTransaction)[];
};

export type SolSignMessageParams = {
  type: "sign_message";
  message: Uint8Array;
};

export type SolSignParams =
  | SolSignTransactionParams
  | SolSignAllTransactionsParams
  | SolSignMessageParams;

export type SolSignTransactionResult = {
  type: "sign_transaction";
  signedTransaction: Transaction | VersionedTransaction;
};

export type SolSignAllTransactionsResult = {
  type: "sign_all_transactions";
  signedTransactions: (Transaction | VersionedTransaction)[];
};

export type SolSignMessageResult = {
  type: "sign_message";
  signature: Uint8Array;
};

export type SolSignResult =
  | SolSignTransactionResult
  | SolSignAllTransactionsResult
  | SolSignMessageResult;
