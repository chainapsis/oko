import type { FC } from "react";
import type { Theme } from "@oko-wallet/oko-common-ui/theme";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./styles.module.scss";
import { SOLANA_LOGO_URL } from "@oko-wallet-attached/constants/urls";

interface SiwsSigTitleBadgeProps {
  theme: Theme | null;
}

export const SiwsSigTitleBadge: FC<SiwsSigTitleBadgeProps> = ({ theme }) => {
  return (
    <div className={styles.badgeContainer}>
      <img src={SOLANA_LOGO_URL} alt="Solana" className={styles.solanaLogo} />
      <Typography size="lg" color="primary" weight="bold">
        Sign In With Solana
      </Typography>
    </div>
  );
};
