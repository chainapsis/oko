import type { Msg, StdSignDoc } from "@keplr-wallet/types";
import type { CosmosTxSignPayload } from "@oko-wallet/oko-sdk-core";
import type { Result } from "@oko-wallet/stdlib-js";

import {
  useGetParsedMsgs,
  useGetSignDocStringWithParsedMsg,
} from "./use_parse_msgs";
import type { UnpackedMsgForView } from "@oko-wallet-attached/types/cosmos_msg";
import { extractMsgsFromSignDoc } from "@oko-wallet-attached/web3/cosmos/sign_doc";

export function useCosmosTxSummary(
  args: UseCosmosTxSummaryArgs,
): Result<UseCosmosTxSummaryReturn, UseCosmosTxSummaryError> {
  const { payload, signDocJson } = args;

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

  return {
    success: true,
    data: {
      isLoading,
      signDocString,
      msgs,
    },
  };
}

export interface UseCosmosTxSummaryArgs {
  payload: CosmosTxSignPayload;
  signDocJson: StdSignDoc;
}

export interface UseCosmosTxSummaryReturn {
  isLoading: boolean;
  signDocString: string;
  msgs: readonly Msg[] | UnpackedMsgForView[];
}

export type UseCosmosTxSummaryError = {
  type: "extract_msg_from_sign_doc_fail";
};
