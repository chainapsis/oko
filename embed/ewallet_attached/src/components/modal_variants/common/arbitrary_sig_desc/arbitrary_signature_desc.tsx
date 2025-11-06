import type { FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./arbitrary_signature_description.module.scss";

export const ArbitrarySignatureDesc: FC = () => {
  return (
    <Typography
      size="xs"
      weight="medium"
      color="tertiary"
      className={styles.description}
    >
      This step doesn’t involve the blockchain. No fees apply.
    </Typography>
  );
};
