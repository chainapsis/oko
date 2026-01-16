/**
 * Token and balance type definitions
 * Replaces CoinPretty, PricePretty from @keplr-wallet/unit
 */

import type { Currency, ModularChainInfo } from "./chain";

// Raw balance from API
export interface RawBalance {
  readonly denom: string;
  readonly amount: string;
}

// Token with metadata
export interface Token {
  readonly currency: Currency;
  readonly amount: string; // Raw amount in minimal denom
}

// Token balance with chain info and price
export interface TokenBalance {
  readonly chainInfo: ModularChainInfo;
  readonly token: Token;
  readonly address: string | undefined;
  readonly priceUsd: number | undefined;
  readonly isFetching: boolean;
  readonly error: Error | undefined;
}

// Formatted token for display
export interface FormattedToken {
  readonly symbol: string;
  readonly amount: string; // Human readable amount
  readonly amountRaw: string; // Raw amount
  readonly decimals: number;
  readonly imageUrl?: string;
  readonly priceUsd?: number;
  readonly valueUsd?: number;
}

// Price info from CoinGecko
export interface PriceInfo {
  readonly coinGeckoId: string;
  readonly usd: number;
  readonly usd_24h_change?: number;
}
