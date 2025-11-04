import type {
  EWalletMsgGetEthChainInfo,
  EWalletMsgGetEthChainInfoAck,
} from "@oko-wallet/oko-sdk-core";
import type { ChainInfo } from "@keplr-wallet/types";

import {
  getAllChainsCached,
  filterEthChains,
} from "@oko-wallet-attached/requests/chain_infos";
import { EWALLET_SDK_TARGET } from "./target";
import type { MsgEventContext } from "./types";

export async function handleGetEthChain(
  ctx: MsgEventContext,
  message: EWalletMsgGetEthChainInfo,
): Promise<void> {
  const { port } = ctx;

  try {
    console.debug("[attached] handling get_eth_chain");

    if (message.msg_type !== "get_eth_chain_info") {
      throw new Error("Invalid message type");
    }

    const chainId = message.payload.chain_id;

    const allChains = await getAllChainsCached();
    const chainInfos = filterEthChains(allChains);

    let resultChains: ChainInfo[] = [];

    let formattedChainId = chainId;
    if (chainId) {
      formattedChainId = chainId.startsWith("eip155:")
        ? chainId
        : `eip155:${parseInt(chainId)}`;
    }

    if (formattedChainId) {
      const foundChain = chainInfos.find(
        (chain) => chain.chainId === formattedChainId,
      );
      if (!foundChain) {
        throw new Error(`Chain not found: ${formattedChainId}`);
      }
      resultChains = [foundChain];
    } else {
      resultChains = chainInfos;
    }

    const ack: EWalletMsgGetEthChainInfoAck = {
      target: EWALLET_SDK_TARGET,
      msg_type: "get_eth_chain_info_ack",
      payload: {
        success: true,
        data: resultChains,
      },
    };

    port.postMessage(ack);
  } catch (error: any) {
    console.error("[attached] handling get_cosmos_chain fail, err: %o", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    const ack: EWalletMsgGetEthChainInfoAck = {
      target: EWALLET_SDK_TARGET,
      msg_type: "get_eth_chain_info_ack",
      payload: {
        success: false,
        err: errorMessage,
      },
    };

    port.postMessage(ack);
  }
}
