import type { EthereumTxSignPayload } from "@oko-wallet/oko-sdk-core";
import type { FC } from "react";
import type { RpcTransactionRequest } from "viem";

import { Actions } from "./actions/actions";
import type { RenderContext } from "./actions/types";
import { useEthereumTxActions } from "./hooks/use_ethereum_tx_actions";
import { useTrackTxSummaryView } from "@oko-wallet-attached/analytics/events";
import { TransactionSummaryFrame } from "@oko-wallet-attached/components/modal_variants/common/transaction_summary";

export interface EthereumTxSummaryProps {
  payload: EthereumTxSignPayload;
  simulatedTransaction: RpcTransactionRequest | null;
}

export const EthereumTxSummary: FC<EthereumTxSummaryProps> = ({
  payload,
  simulatedTransaction,
}) => {
  const { actions, chain, isLoading, error } = useEthereumTxActions(payload);

  const rawTx = simulatedTransaction ?? payload.data.transaction;
  const actionCount = actions?.length ?? 0;

  useTrackTxSummaryView({
    hostOrigin: payload.origin,
    chainType: "eth",
    chainId: payload.chain_info.chain_id,
    actions,
  });

  const context: RenderContext = {
    isLoading: isLoading,
    error: error ?? undefined,
    chain: chain,
  };

  return (
    <TransactionSummaryFrame
      count={actionCount}
      countLabel=" Action(s)"
      rawData={JSON.stringify(rawTx, null, 2)}
      smartContent={<Actions actions={actions} context={context} />}
    />
  );
};
