import type { IdentifierString } from "@wallet-standard/base";

export const SOLANA_MAINNET_CHAIN = "solana:mainnet" as IdentifierString;
export const SOLANA_DEVNET_CHAIN = "solana:devnet" as IdentifierString;
export const SOLANA_TESTNET_CHAIN = "solana:testnet" as IdentifierString;

export const SOLANA_CHAINS = [
  SOLANA_MAINNET_CHAIN,
  SOLANA_DEVNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
] as const;

export type SolanaChain = (typeof SOLANA_CHAINS)[number];

export function isSolanaChain(chain: string): chain is SolanaChain {
  return SOLANA_CHAINS.includes(chain as SolanaChain);
}
