import { useState } from "react";
import type { CosmosTxSignPayload } from "@oko-wallet/oko-sdk-core";
import type { Msg, StdSignDoc } from "@keplr-wallet/types";
import type { Result } from "@oko-wallet/stdlib-js";

import { extractMsgsFromSignDoc } from "@oko-wallet-attached/web3/cosmos/sign_doc";
import {
  useGetParsedMsgs,
  useGetSignDocStringWithParsedMsg,
} from "./use_parse_msgs";
import type { UnpackedMsgForView } from "@oko-wallet-attached/types/cosmos_msg";

export function useCosmosTxSummary(
  args: UseCosmosTxSummaryArgs,
): Result<UseCosmosTxSummaryReturn, UseCosmosTxSummaryError> {
  const { payload, signDocJson } = args;

  const [isRawView, setIsRawView] = useState(false);

  const unparsedMsgsRes = extractMsgsFromSignDoc(payload.signDoc);
  if (!unparsedMsgsRes.success) {
    return { success: false, err: { type: "extract_msg_from_sign_doc_fail" } };
  }

  const unparsedMsgs = unparsedMsgsRes.data;

  const chainPrefix =
    payload.chain_info?.bech32_config?.bech32PrefixAccAddr ??
    payload.signer.split("1")[0];

  const { data: msgs, isLoading: isMsgsLoading } = useGetParsedMsgs({
    chainPrefix,
    messages: unparsedMsgs,
  });

  const { signDocString, isLoading: isSignDocLoading } =
    useGetSignDocStringWithParsedMsg(chainPrefix, unparsedMsgs, signDocJson);

  const isLoading = isSignDocLoading || isMsgsLoading;

  function handleToggleView() {
    setIsRawView((prev) => !prev);
  }

  return {
    success: true,
    data: {
      isLoading,
      handleToggleView,
      signDocString,
      msgs,
      isRawView,
    },
  };
}

export interface UseCosmosTxSummaryArgs {
  payload: CosmosTxSignPayload;
  signDocJson: StdSignDoc;
}

export interface UseCosmosTxSummaryReturn {
  isLoading: boolean;
  handleToggleView: () => void;
  signDocString: string;
  msgs: readonly Msg[] | UnpackedMsgForView[];
  isRawView: boolean;
}

export type UseCosmosTxSummaryError = {
  type: "extract_msg_from_sign_doc_fail";
};
