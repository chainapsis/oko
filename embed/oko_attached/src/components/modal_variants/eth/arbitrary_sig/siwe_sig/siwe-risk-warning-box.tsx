import type { FC } from "react";
import { Checkbox } from "@oko-wallet/oko-common-ui/checkbox";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./siwe-risk-warning-box.module.scss";

interface SiweRiskWarningCheckBoxProps {
  checked: boolean;
  onChange: (isValidSiweMessage: boolean) => void;
}
export const SiweRiskWarningCheckBox: FC<SiweRiskWarningCheckBoxProps> = ({
  checked,
  onChange,
}) => {
  return (
    <div className={styles.siweRiskWarningContainer}>
      <Checkbox
        id="siwe-message-checkbox"
        checked={checked}
        onChange={onChange}
        label="I understand the risk and would like to proceed."
        labelStyle={{
          color: "secondary",
          size: "xs",
          weight: "medium",
        }}
        checkboxContainerClassName={styles.siweRiskWarningCheckBoxContainer}
        checkBoxInputContainerClassName={
          styles.siweRiskWarningCheckBoxInputContainerClassName
        }
      />
    </div>
  );
};

export const SiweRiskWarningBox = () => {
  return (
    <div className={styles.siweRiskWarningBox}>
      <Typography size="xs" color="warning-primary" weight="medium">
        The URL requesting your signature differs from the current website. This
        may indicate a potential security risk.
      </Typography>
    </div>
  );
};
