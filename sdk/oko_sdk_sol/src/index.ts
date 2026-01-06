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

// Wallet Standard
export {
  registerOkoWallet,
  OkoStandardWallet,
  OKO_WALLET_NAME,
  OkoSolanaWalletAccount,
  OKO_ACCOUNT_FEATURES,
  SOLANA_CHAINS,
  SOLANA_MAINNET_CHAIN,
  SOLANA_DEVNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
  isSolanaChain,
  OKO_ICON,
  buildSignInMessage,
  createSignInFeature,
} from "./wallet-standard";

export type { SolanaChain } from "./wallet-standard";
