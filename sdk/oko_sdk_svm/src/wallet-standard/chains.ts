import type { IdentifierString } from "@wallet-standard/base";

export interface WalletStandardConfig {
  readonly chains: readonly IdentifierString[];
  readonly features: {
    readonly signIn: IdentifierString;
    readonly signMessage: IdentifierString;
    readonly signTransaction: IdentifierString;
    readonly signAndSendTransaction: IdentifierString;
  };
  readonly rpcEndpoints: Partial<Record<IdentifierString, string>>;
}
