import type { FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import type { RenderContext, EthTxAction } from "../types";
import { TxContainer } from "../common/tx_container";

export const FallbackAction: FC<FallbackActionProps> = ({ action }) => {
  return (
    <TxContainer>
      <Typography color="secondary" size="sm" weight="medium">
        {action.kind}
      </Typography>
    </TxContainer>
  );
};

export interface FallbackActionProps {
  action: EthTxAction;
  ctx?: RenderContext;
}
