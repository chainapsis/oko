import type { IdentifierString } from "@wallet-standard/base";

// CAIP-2 standard chain IDs using genesis hash (first 32 characters)
export const SOLANA_MAINNET_CHAIN = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as IdentifierString;
export const SOLANA_DEVNET_CHAIN = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1" as IdentifierString;
export const SOLANA_TESTNET_CHAIN = "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z" as IdentifierString;

export const SOLANA_CHAINS = [
  SOLANA_MAINNET_CHAIN,
  SOLANA_DEVNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
] as const;

export type SolanaChain = (typeof SOLANA_CHAINS)[number];

export function isSolanaChain(chain: string): chain is SolanaChain {
  return SOLANA_CHAINS.includes(chain as SolanaChain);
}
