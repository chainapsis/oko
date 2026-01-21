export { OkoSvmWallet } from "./svm_wallet";
export { SvmWalletEventEmitter } from "./emitter";

export type {
  OkoSvmWalletState,
  OkoSvmWalletInitArgs,
  OkoSvmWalletStaticInterface,
  OkoSvmWalletInterface,
  SvmSignParams,
  SvmSignResult,
  SvmSignTransactionParams,
  SvmSignAllTransactionsParams,
  SvmSignMessageParams,
  SvmSignTransactionResult,
  SvmSignAllTransactionsResult,
  SvmSignMessageResult,
  SvmWalletEvent,
  SvmWalletEventMap,
  SvmWalletEventHandler,
} from "./types";

export type {
  OkoSvmWalletInitError,
  LazyInitError,
  OkoSvmWalletError,
} from "./errors";

// Wallet Standard (keep Solana-specific names for compatibility)
export {
  registerOkoWallet,
  OkoStandardWallet,
  OKO_WALLET_NAME,
  OkoSvmWalletAccount,
  OKO_ACCOUNT_FEATURES,
  SOLANA_CHAINS,
  SOLANA_MAINNET_CHAIN,
  SOLANA_DEVNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
  isSolanaChain,
  isSvmChain,
  OKO_ICON,
  buildSignInMessage,
  createSignInFeature,
} from "./wallet-standard";

export type { SolanaChain, SvmChain } from "./wallet-standard";
