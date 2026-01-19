import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { FC } from "react";

import styles from "../instructions.module.scss";
import { TxRow } from "@oko-wallet-attached/components/modal_variants/common/tx_row";
import type { ParsedInstruction } from "@oko-wallet-attached/tx-parsers/sol";

export interface UnknownInstructionProps {
  instruction: ParsedInstruction;
}

export const UnknownInstruction: FC<UnknownInstructionProps> = ({
  instruction,
}) => {
  const { programName, instructionName, data } = instruction;

  return (
    <div className={styles.container}>
      <TxRow label="Action">
        <Typography color="primary" size="sm" weight="semibold">
          {instructionName}
        </Typography>
      </TxRow>
      {Object.keys(data).length > 0 && data.raw === undefined && (
        <TxRow label="Data">
          <Typography
            color="secondary"
            size="sm"
            weight="medium"
            style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}
          >
            {JSON.stringify(data, null, 2)}
          </Typography>
        </TxRow>
      )}
      <TxRow label="Program">
        <Typography color="tertiary" size="sm" weight="medium">
          {programName}
        </Typography>
      </TxRow>
    </div>
  );
};
