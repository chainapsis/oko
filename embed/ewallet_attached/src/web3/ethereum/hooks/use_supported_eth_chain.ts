import { useQuery } from "@tanstack/react-query";
import type { ChainInfoForAttachedModal } from "@oko-wallet/oko-sdk-core";
import type { ChainInfo } from "@keplr-wallet/types";
import type { Chain } from "viem";

import { toEthereumChain } from "@oko-wallet-attached/web3/ethereum/utils";
import { allChainsQuery } from "@oko-wallet-attached/requests/chain_infos";

export interface UseSupportedEthChainResult {
  isSupportedChain: boolean;
  isSupportChecking: boolean;
  isSupportChecked: boolean;
  evmChain?: Chain;
  registryChain?: ChainInfo;
}

export interface UseSupportedEthChainProps {
  chainInfoForModal: ChainInfoForAttachedModal;
}

export function useSupportedEthChain({
  chainInfoForModal,
}: UseSupportedEthChainProps): UseSupportedEthChainResult {
  const {
    data,
    isLoading: isSupportChecking,
    isFetched: isSupportChecked,
  } = useQuery(allChainsQuery);

  const matchedChain = data?.find(
    (c) => c.chainId === chainInfoForModal.chain_id,
  );
  const evmChain = matchedChain
    ? toEthereumChain(chainInfoForModal)
    : undefined;

  return {
    isSupportedChain: !!matchedChain,
    isSupportChecking,
    isSupportChecked,
    evmChain,
    registryChain: matchedChain,
  };
}
