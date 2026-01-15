import type { FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "@oko-wallet-attached/components/modal_variants/common/arbitrary_sig_desc/arbitrary_signature_description.module.scss";

export const X402PaymentDesc: FC = () => {
  return (
    <Typography
      size="xs"
      weight="medium"
      color="tertiary"
      className={styles.description}
    >
      This will authorize a payment. Gas fees are covered by the facilitator.
    </Typography>
  );
};
