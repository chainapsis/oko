import { type FC } from "react";

import { TxContainer } from "../common/tx_container";
import { TokenInfo } from "../common/token_info";
import { AddressInfo } from "../common/address_info";
import { TxRow } from "@oko-wallet-attached/components/modal_variants/common/tx_row";
import type { RenderContext, ERC20TransferAction } from "../types";

export const ERC20Transfer: FC<ERC20TransferProps> = ({ action, ctx }) => {
  return (
    <TxContainer>
      <TxRow label="Send">
        <TokenInfo
          tokenAddress={action.tokenAddress}
          amount={action.amount}
          chain={ctx?.chain}
          currency={action.currency}
        />
      </TxRow>
      <TxRow label="to">
        <AddressInfo address={action.to} />
      </TxRow>
    </TxContainer>
  );
};

export interface ERC20TransferProps {
  action: ERC20TransferAction;
  ctx?: RenderContext;
}
