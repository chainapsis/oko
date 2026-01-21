export { OkoSolWallet } from "./sol_wallet";
export { SolWalletEventEmitter } from "./emitter";

export type {
  OkoSolWalletState,
  OkoSolWalletInitArgs,
  OkoSolWalletStaticInterface,
  OkoSolWalletInterface,
  SolSignParams,
  SolSignResult,
  SolSignTransactionParams,
  SolSignAllTransactionsParams,
  SolSignMessageParams,
  SolSignTransactionResult,
  SolSignAllTransactionsResult,
  SolSignMessageResult,
  SolWalletEvent,
  SolWalletEventMap,
  SolWalletEventHandler,
} from "./types";

export type {
  OkoSolWalletInitError,
  LazyInitError,
  OkoSolWalletError,
} from "./errors";

export {
  registerWalletStandard,
  OkoStandardWallet,
  OKO_WALLET_NAME,
  OkoSolanaWalletAccount,
  buildSignInMessage,
  createSignInFeature,
} from "./wallet-standard";

export type { WalletStandardConfig } from "./wallet-standard";
