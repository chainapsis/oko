import type { IdentifierString, WalletAccount } from "@wallet-standard/base";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignInFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature,
} from "@solana/wallet-standard-features";

import { SOLANA_CHAINS, type SolanaChain } from "./chains";

type SolanaFeatureKey = keyof (SolanaSignInFeature &
  SolanaSignMessageFeature &
  SolanaSignTransactionFeature &
  SolanaSignAndSendTransactionFeature);

export const OKO_ACCOUNT_FEATURES: readonly IdentifierString[] = [
  "solana:signIn",
  "solana:signMessage",
  "solana:signTransaction",
  "solana:signAndSendTransaction",
] as const satisfies readonly SolanaFeatureKey[];

export class OkoSolanaWalletAccount implements WalletAccount {
  readonly address: string;
  readonly publicKey: Uint8Array;
  readonly chains: readonly SolanaChain[];
  readonly features: readonly IdentifierString[];

  constructor(address: string, publicKey: Uint8Array) {
    this.address = address;
    this.publicKey = publicKey;
    this.chains = SOLANA_CHAINS;
    this.features = OKO_ACCOUNT_FEATURES;
  }
}
