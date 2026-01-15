import type { FC } from "react";

import { TxRow } from "@oko-wallet-attached/components/modal_variants/common/tx_row";

import { AddressInfo } from "../common/address_info";
import { TokenInfo } from "../common/token_info";
import { TxContainer } from "../common/tx_container";
import type { ERC20TransferAction, RenderContext } from "../types";

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
