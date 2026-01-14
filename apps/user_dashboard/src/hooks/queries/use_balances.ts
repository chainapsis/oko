/**
 * Balance fetching with TanStack Query
 * Replaces store_legacy/huge-queries balance logic
 */

import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ModularChainInfo } from "@oko-wallet-user-dashboard/types/chain";
import type { TokenBalance, RawBalance } from "@oko-wallet-user-dashboard/types/token";
import { getChainIdentifier } from "@oko-wallet-user-dashboard/state/chains";
import { isCosmosChainId } from "@oko-wallet-user-dashboard/utils/chain";
import { useEnabledChains } from "./use_chains";
import { usePrices } from "./use_prices";
import { useEthAddress, useBech32Addresses } from "./use_addresses";

/**
 * Fetch Cosmos balances from LCD endpoint
 */
async function fetchCosmosBalances(
  restEndpoint: string,
  bech32Address: string
): Promise<RawBalance[]> {
  const response = await fetch(
    `${restEndpoint}/cosmos/bank/v1beta1/balances/${bech32Address}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch balances: ${response.statusText}`);
  }

  const data = await response.json();
  return (data.balances ?? []) as RawBalance[];
}

/**
 * Fetch EVM native balance
 */
async function fetchEvmBalance(
  rpcEndpoint: string,
  address: string
): Promise<string> {
  const response = await fetch(rpcEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch EVM balance: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }

  // Convert hex to decimal string
  return BigInt(data.result).toString();
}

interface UseBalancesOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch balances for a specific chain
 */
export function useChainBalances(
  chainInfo: ModularChainInfo | undefined,
  options?: UseBalancesOptions
) {
  const chainId = chainInfo?.chainId;
  const isEvm = chainInfo?.evm !== undefined;
  const isCosmos = chainInfo?.cosmos !== undefined;

  // Get addresses using TanStack Query hooks
  const { address: ethAddress } = useEthAddress();
  const cosmosChainIds = useMemo(
    () => (chainId && isCosmos ? [chainId] : []),
    [chainId, isCosmos]
  );
  const { addresses: bech32Addresses } = useBech32Addresses(cosmosChainIds);
  const bech32Address = chainId ? bech32Addresses[chainId] : undefined;

  // Cosmos balances query
  const cosmosQuery = useQuery({
    queryKey: ["balances", "cosmos", chainId, bech32Address],
    queryFn: async () => {
      if (!chainInfo?.cosmos?.rest || !bech32Address) {
        return [];
      }
      return fetchCosmosBalances(chainInfo.cosmos.rest, bech32Address);
    },
    enabled:
      (options?.enabled ?? true) &&
      isCosmos &&
      !!bech32Address &&
      !!chainInfo?.cosmos?.rest,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  // EVM native balance query
  const evmQuery = useQuery({
    queryKey: ["balances", "evm", chainId, ethAddress],
    queryFn: async () => {
      if (!chainInfo?.evm?.rpc || !ethAddress) {
        return "0";
      }
      return fetchEvmBalance(chainInfo.evm.rpc, ethAddress);
    },
    enabled:
      (options?.enabled ?? true) &&
      isEvm &&
      !!ethAddress &&
      !!chainInfo?.evm?.rpc,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  return {
    cosmosBalances: cosmosQuery.data ?? [],
    evmBalance: evmQuery.data ?? "0",
    isLoading: cosmosQuery.isLoading || evmQuery.isLoading,
    isFetching: cosmosQuery.isFetching || evmQuery.isFetching,
    error: cosmosQuery.error || evmQuery.error,
  };
}

/**
 * Hook to fetch balances for all enabled chains
 */
export function useAllBalances() {
  const { chains: enabledChains, isLoading: chainsLoading } = useEnabledChains();
  const { priceMap, isLoading: pricesLoading } = usePrices();

  // Get addresses using TanStack Query hooks
  const { address: ethAddress, isLoading: ethLoading } = useEthAddress();
  const cosmosChainIds = useMemo(
    () => enabledChains
      .filter((chain) => isCosmosChainId(chain.chainId))
      .map((chain) => chain.chainId),
    [enabledChains]
  );
  const { addresses: bech32Addresses, isLoading: addressesLoading } = useBech32Addresses(cosmosChainIds);

  // Create queries for all chains
  const balanceQueries = useQueries({
    queries: enabledChains.map((chain) => {
      const isCosmos = chain.cosmos !== undefined;
      const isEvm = chain.evm !== undefined;
      const bech32Address = isCosmos
        ? bech32Addresses[chain.chainId]
        : undefined;

      return {
        queryKey: ["balances", chain.chainId, bech32Address, ethAddress],
        queryFn: async (): Promise<TokenBalance[]> => {
          const results: TokenBalance[] = [];

          // Fetch Cosmos balances
          if (isCosmos && bech32Address && chain.cosmos?.rest) {
            try {
              const rawBalances = await fetchCosmosBalances(
                chain.cosmos.rest,
                bech32Address
              );

              for (const bal of rawBalances) {
                const currency = chain.cosmos.currencies.find(
                  (c) => c.coinMinimalDenom === bal.denom
                );
                if (currency && BigInt(bal.amount) > BigInt(0)) {
                  results.push({
                    chainInfo: chain,
                    token: { currency, amount: bal.amount },
                    address: bech32Address,
                    priceUsd: currency.coinGeckoId
                      ? priceMap[currency.coinGeckoId]
                      : undefined,
                    isFetching: false,
                    error: undefined,
                  });
                }
              }
            } catch (error) {
              console.error(
                `Failed to fetch Cosmos balances for ${chain.chainId}:`,
                error
              );
            }
          }

          // Fetch EVM native balance
          if (isEvm && ethAddress && chain.evm?.rpc) {
            try {
              const balance = await fetchEvmBalance(chain.evm.rpc, ethAddress);
              const nativeCurrency = chain.evm.currencies[0];
              if (nativeCurrency && BigInt(balance) > BigInt(0)) {
                results.push({
                  chainInfo: chain,
                  token: { currency: nativeCurrency, amount: balance },
                  address: ethAddress,
                  priceUsd: nativeCurrency.coinGeckoId
                    ? priceMap[nativeCurrency.coinGeckoId]
                    : undefined,
                  isFetching: false,
                  error: undefined,
                });
              }
            } catch (error) {
              console.error(
                `Failed to fetch EVM balance for ${chain.chainId}:`,
                error
              );
            }
          }

          return results;
        },
        enabled:
          (isCosmos && !!bech32Address) || (isEvm && !!ethAddress),
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000,
      };
    }),
  });

  // Aggregate all balances
  const allBalances = balanceQueries
    .flatMap((query) => query.data ?? [])
    .sort((a, b) => {
      // Sort by USD value (descending)
      const aValue =
        a.priceUsd && a.token.currency.coinDecimals
          ? (Number(a.token.amount) / 10 ** a.token.currency.coinDecimals) *
            a.priceUsd
          : 0;
      const bValue =
        b.priceUsd && b.token.currency.coinDecimals
          ? (Number(b.token.amount) / 10 ** b.token.currency.coinDecimals) *
            b.priceUsd
          : 0;
      return bValue - aValue;
    });

  // Group balances by chain identifier
  const balancesByChainIdentifier = allBalances.reduce<
    Map<string, TokenBalance[]>
  >((map, balance) => {
    const identifier = getChainIdentifier(balance.chainInfo.chainId);
    const existing = map.get(identifier) ?? [];
    existing.push(balance);
    map.set(identifier, existing);
    return map;
  }, new Map());

  const isLoading =
    chainsLoading || ethLoading || addressesLoading || balanceQueries.some((q) => q.isLoading) || pricesLoading;
  const isFetching = balanceQueries.some((q) => q.isFetching);
  const hasError = balanceQueries.some((q) => q.error);

  return {
    balances: allBalances,
    balancesByChainIdentifier,
    isLoading,
    isFetching,
    hasError,
  };
}

/**
 * Calculate total USD value of all balances
 */
export function useTotalBalance() {
  const { balances, isLoading } = useAllBalances();

  const totalUsd = balances.reduce((sum, bal) => {
    if (!bal.priceUsd) return sum;
    const amount =
      Number(bal.token.amount) / 10 ** bal.token.currency.coinDecimals;
    return sum + amount * bal.priceUsd;
  }, 0);

  return {
    totalUsd,
    isLoading,
  };
}
