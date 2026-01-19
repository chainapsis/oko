/**
 * Address fetching with TanStack Query
 * Replaces the side-effect based address fetching in state/addresses.ts
 */

import { useQuery } from "@tanstack/react-query";

import {
  useSDKState,
  selectEthSDK,
  selectCosmosSDK,
  selectEthInitialized,
  selectCosmosInitialized,
} from "@oko-wallet-user-dashboard/state/sdk";
import { isEvmOnlyChain } from "@oko-wallet-user-dashboard/utils/chain";
import type { ModularChainInfo } from "@oko-wallet-user-dashboard/types/chain";

/**
 * Hook to get ETH address
 */
export function useEthAddress() {
  const okoEth = useSDKState(selectEthSDK);
  const isInitialized = useSDKState(selectEthInitialized);

  const query = useQuery({
    queryKey: ["address", "eth"],
    queryFn: async () => {
      if (!okoEth) {
        return undefined;
      }
      return okoEth.getAddress();
    },
    enabled: !!okoEth && isInitialized,
    staleTime: Infinity, // Address doesn't change
    gcTime: Infinity,
  });

  return {
    address: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to get Bech32 address for a specific chain
 */
export function useBech32Address(chainId: string | undefined) {
  const okoCosmos = useSDKState(selectCosmosSDK);
  const isInitialized = useSDKState(selectCosmosInitialized);

  // Skip for non-cosmos chains
  const isCosmosChain = Boolean(
    chainId &&
      !chainId.startsWith("eip155:") &&
      !chainId.startsWith("bip122:") &&
      !chainId.startsWith("starknet:"),
  );

  const query = useQuery({
    queryKey: ["address", "bech32", chainId],
    queryFn: async () => {
      if (!okoCosmos || !chainId) {
        return undefined;
      }
      try {
        const key = await okoCosmos.getKey(chainId);
        return key?.bech32Address;
      } catch (error) {
        console.error(`Failed to fetch bech32 address for ${chainId}:`, error);
        return undefined;
      }
    },
    enabled: !!okoCosmos && isInitialized && !!chainId && isCosmosChain,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    address: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to get address for a chain (auto-detects chain type)
 */
export function useChainAddress(chainInfo: ModularChainInfo | undefined) {
  const { address: ethAddress, isLoading: ethLoading } = useEthAddress();
  const { address: bech32Address, isLoading: bech32Loading } = useBech32Address(
    chainInfo && !isEvmOnlyChain(chainInfo) ? chainInfo.chainId : undefined,
  );

  if (!chainInfo) {
    return { address: undefined, isLoading: false };
  }

  if (isEvmOnlyChain(chainInfo)) {
    return { address: ethAddress, isLoading: ethLoading };
  }

  return { address: bech32Address, isLoading: bech32Loading };
}

/**
 * Hook to prefetch bech32 addresses for multiple chains
 * Useful for batch loading addresses for a list of chains
 */
export function useBech32Addresses(chainIds: string[]) {
  const okoCosmos = useSDKState(selectCosmosSDK);
  const isInitialized = useSDKState(selectCosmosInitialized);

  // Filter to cosmos-only chains
  const cosmosChainIds = chainIds.filter(
    (id) =>
      !id.startsWith("eip155:") &&
      !id.startsWith("bip122:") &&
      !id.startsWith("starknet:"),
  );

  const query = useQuery({
    queryKey: ["addresses", "bech32", cosmosChainIds.sort().join(",")],
    queryFn: async () => {
      if (!okoCosmos) {
        return {};
      }

      const results: Record<string, string | undefined> = {};

      await Promise.all(
        cosmosChainIds.map(async (chainId) => {
          try {
            const key = await okoCosmos.getKey(chainId);
            results[chainId] = key?.bech32Address;
          } catch (error) {
            console.error(
              `Failed to fetch bech32 address for ${chainId}:`,
              error,
            );
            results[chainId] = undefined;
          }
        }),
      );

      return results;
    },
    enabled: !!okoCosmos && isInitialized && cosmosChainIds.length > 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    addresses: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
  };
}
