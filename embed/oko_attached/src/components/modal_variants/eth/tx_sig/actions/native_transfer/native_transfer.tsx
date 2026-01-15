import type { FC } from "react";

import { TxContainer } from "../common/tx_container";
import { TokenInfo } from "../common/token_info";
import { AddressInfo } from "../common/address_info";
import { TxRow } from "@oko-wallet-attached/components/modal_variants/common/tx_row";
import type { RenderContext, NativeTransferTxAction } from "../types";

export const NativeTransfer: FC<NativeTransferProps> = ({ action, ctx }) => {
  return (
    <TxContainer>
      <TxRow label="Send">
        <TokenInfo
          chain={ctx?.chain}
          currency={action.currency}
          amount={action.amount}
        />
      </TxRow>
      <TxRow label="to">
        <AddressInfo address={action.to} />
      </TxRow>
    </TxContainer>
  );
};

export interface NativeTransferProps {
  action: NativeTransferTxAction;
  ctx?: RenderContext;
}
