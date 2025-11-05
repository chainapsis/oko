import type { EthereumTxSignPayload } from "@oko-wallet/oko-sdk-core";
import { Spacing } from "@oko-wallet/ewallet-common-ui/spacing";
import type { RpcTransactionRequest } from "viem";
import { Fragment, type FC } from "react";

import { EthereumTxSummary } from "./ethereum_tx_summary";
import { MetadataContent } from "@oko-wallet-attached/components/modal_variants/common/metadata_content/metadata_content";

interface EthereumTxSignatureContentProps {
  payload: EthereumTxSignPayload;
  simulatedTransaction: RpcTransactionRequest | null;
}

export const EthereumTxSignatureContent: FC<
  EthereumTxSignatureContentProps
> = ({ payload, simulatedTransaction }) => {
  return (
    <Fragment>
      <MetadataContent
        origin={payload.origin}
        chainInfo={payload.chain_info}
        signer={payload.signer}
      />
      <Spacing height={28} />
      <EthereumTxSummary
        payload={payload}
        simulatedTransaction={simulatedTransaction}
      />
    </Fragment>
  );
};
