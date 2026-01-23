import type { Msg, StdSignDoc } from "@keplr-wallet/types";
import type { CosmosTxSignPayload } from "@oko-wallet/oko-sdk-core";
import type { FC } from "react";

import { Messages } from "./msg/messages";
import { useCosmosTxSummary } from "./use_tx_summary";
import { useTrackTxSummaryView } from "@oko-wallet-attached/analytics/events";
import { TransactionSummaryFrame } from "@oko-wallet-attached/components/modal_variants/common/transaction_summary";
import type { UnpackedMsgForView } from "@oko-wallet-attached/types/cosmos_msg";

export interface CosmosTxSummaryProps {
  payload: CosmosTxSignPayload;
  signDocJson: StdSignDoc;
  modalId: string;
}

export const CosmosTxSummary: FC<CosmosTxSummaryProps> = ({
  payload,
  signDocJson,
}) => {
  const useCosmosTxSummaryRes = useCosmosTxSummary({ payload, signDocJson });

  if (!useCosmosTxSummaryRes.success) {
    return null;
  }

  const { msgs, signDocString, isLoading } = useCosmosTxSummaryRes.data;

  return (
    <CosmosTxSummaryContent
      payload={payload}
      msgs={msgs}
      signDocString={signDocString}
      isLoading={isLoading}
    />
  );
};

interface CosmosTxSummaryContentProps {
  payload: CosmosTxSignPayload;
  msgs: readonly Msg[] | UnpackedMsgForView[];
  signDocString: string;
  isLoading: boolean;
}

const CosmosTxSummaryContent: FC<CosmosTxSummaryContentProps> = ({
  payload,
  msgs,
  signDocString,
  isLoading,
}) => {
  useTrackTxSummaryView({
    hostOrigin: payload.origin,
    chainType: "cosmos",
    chainId: payload.chain_info.chain_id,
    messages: msgs,
  });

  return (
    <TransactionSummaryFrame
      count={msgs.length}
      countLabel=" Message(s)"
      rawData={signDocString}
      smartContent={
        <Messages
          chainId={payload.chain_info.chain_id}
          messages={msgs}
          isLoading={isLoading}
        />
      }
    />
  );
};
