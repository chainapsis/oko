import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { FC } from "react";

import styles from "../instructions.module.scss";
import type { ParsedInstruction } from "@oko-wallet-attached/tx-parsers/svm";

export interface UnknownInstructionProps {
  instruction: ParsedInstruction;
}

export const UnknownInstruction: FC<UnknownInstructionProps> = ({
  instruction,
}) => {
  const { data } = instruction;

  return (
    <div className={styles.container}>
      <Typography
        color="secondary"
        size="sm"
        weight="medium"
        style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}
      >
        {JSON.stringify(data, null, 2)}
      </Typography>
    </div>
  );
};
