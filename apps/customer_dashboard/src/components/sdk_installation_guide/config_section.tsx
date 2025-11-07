import { FC, ReactNode } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./sdk_installation_guide.module.scss";

interface ConfigSectionProps {
  label: string;
  children: ReactNode;
}

export const ConfigSection: FC<ConfigSectionProps> = ({ label, children }) => (
  <div>
    <Typography
      size="md"
      weight="medium"
      color="tertiary"
      className={styles.configLabel}
    >
      {label}
    </Typography>
    <div className={styles.optionList}>{children}</div>
  </div>
);
