import type { DecodeFunctionDataReturnType, Hex } from "viem";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { decodeCalldata } from "@oko-wallet-attached/web3/ethereum/decoder";

export interface UseDecodedCalldataProps {
  calldata?: Hex;
  options?: Partial<UseQueryOptions<DecodeFunctionDataReturnType | null>>;
}

export function useDecodedCalldata({
  calldata,
  options,
}: UseDecodedCalldataProps) {
  return useQuery({
    queryKey: ["get-decoded-ethereum-tx-calldata", calldata],
    queryFn: async () => {
      if (!calldata) {
        return null;
      }
      return await decodeCalldata({ calldata });
    },
    ...options,
    enabled: !!calldata && options?.enabled !== false,
  });
}
