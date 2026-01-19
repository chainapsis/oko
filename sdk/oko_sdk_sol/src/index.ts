export { SolWalletEventEmitter } from "./emitter";
export type {
  LazyInitError,
  OkoSolWalletError,
  OkoSolWalletInitError,
} from "./errors";
export { OkoSolWallet } from "./sol_wallet";
export type {
  OkoSolWalletInitArgs,
  OkoSolWalletInterface,
  OkoSolWalletState,
  OkoSolWalletStaticInterface,
  SolSignAllTransactionsParams,
  SolSignAllTransactionsResult,
  SolSignMessageParams,
  SolSignMessageResult,
  SolSignParams,
  SolSignResult,
  SolSignTransactionParams,
  SolSignTransactionResult,
  SolWalletEvent,
  SolWalletEventHandler,
  SolWalletEventMap,
} from "./types";
export type { SolanaChain } from "./wallet-standard";
// Wallet Standard
export {
  buildSignInMessage,
  createSignInFeature,
  isSolanaChain,
  OKO_ACCOUNT_FEATURES,
  OKO_ICON,
  OKO_WALLET_NAME,
  OkoSolanaWalletAccount,
  OkoStandardWallet,
  registerOkoWallet,
  SOLANA_CHAINS,
  SOLANA_DEVNET_CHAIN,
  SOLANA_MAINNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
} from "./wallet-standard";
