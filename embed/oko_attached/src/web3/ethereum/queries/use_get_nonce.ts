import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { Address, Chain, PublicClient } from "viem";

import { classifyViemErrorDetailed } from "@oko-wallet-attached/web3/ethereum/error";
import { DEFAULT_RETRY_COUNT, type StructuredRpcError } from "./types";

export interface UseGetNonceProps {
  simulationKey: string;
  signer: Address;
  chain?: Chain;
  client?: PublicClient;
  options?: Partial<UseQueryOptions<number, StructuredRpcError>>;
}

export function useGetNonce({
  simulationKey,
  signer,
  chain,
  client,
  options,
}: UseGetNonceProps) {
  return useQuery({
    queryKey: ["getNonce", simulationKey, signer, chain?.id],
    queryFn: async () => {
      if (!client) {
        throw new Error("No public client available");
      }

      try {
        const nonce = await client.getTransactionCount({
          address: signer,
          blockTag: "pending",
        });

        return nonce;
      } catch (error) {
        const structuredError = classifyViemErrorDetailed(error);

        console.error("Nonce fetch failed:", structuredError);

        throw structuredError;
      }
    },
    retry(failureCount, error) {
      if (error.retryable) {
        if (failureCount >= DEFAULT_RETRY_COUNT) {
          return false;
        }
        return true;
      }

      return false;
    },
    ...options,
    enabled: !!signer && !!client && options?.enabled !== false,
  });
}
