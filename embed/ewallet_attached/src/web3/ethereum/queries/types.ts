export const DEFAULT_GAS_ESTIMATION = BigInt(21000);
export const DEFAULT_RETRY_COUNT = 3;
export const DEFAULT_MULTIPLIER = 1.5;

export type FeeType = "eip1559" | "legacy";

export type FeeDataValue = {
  type: FeeType;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasPrice?: bigint;
  baseFeePerGas?: bigint;
};

export type GasEstimationValue = bigint;

export type L1GasEstimationValue = {
  l1Gas: bigint;
  l1Fee: bigint;
};

export type FeeCurrencyBalanceValue = {
  amount: bigint;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  feeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

export type ErrorCategory =
  | "NETWORK"
  | "RPC"
  | "INSUFFICIENT_BALANCE"
  | "TIMEOUT"
  | "UNSUPPORTED"
  | "RATE_LIMITED"
  | "UNKNOWN";

export type StructuredRpcError = {
  category: ErrorCategory;
  message: string;
  userMessage?: string;
  retryable: boolean;
  rpcCode?: number | string;
  raw?: unknown;
  name?: string;
};
