import type { FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import { TxContainer } from "../common/tx_container";
import { TxRow } from "@oko-wallet-attached/components/modal_variants/common/tx_row";
import type { RenderContext, UnknownAction } from "../types";

export const Unknown: FC<UnknownProps> = ({ action }) => {
  return (
    <TxContainer>
      <TxRow>
        <Typography color="tertiary" size="xs" weight="medium">
          {action.title}
        </Typography>
      </TxRow>
    </TxContainer>
  );
};

export interface UnknownProps {
  action: UnknownAction;
  ctx?: RenderContext;
}
