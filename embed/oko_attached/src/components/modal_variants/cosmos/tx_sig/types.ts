import type { Currency } from "@keplr-wallet/types";
import type { CoinPretty } from "@keplr-wallet/unit";

export interface FeeCalculated {
  fee:
    | {
        amount: string;
        denom: string;
      }
    | undefined;
  gas: number;
}

export interface InsufficientBalanceFee {
  feeCurrency: Currency;
  amount: CoinPretty;
}
