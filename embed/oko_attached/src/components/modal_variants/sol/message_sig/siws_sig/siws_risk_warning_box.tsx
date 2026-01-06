import type { FC } from "react";
import { Checkbox } from "@oko-wallet/oko-common-ui/checkbox";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./siws_risk_warning_box.module.scss";

interface SiwsRiskWarningCheckBoxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const SiwsRiskWarningCheckBox: FC<SiwsRiskWarningCheckBoxProps> = ({
  checked,
  onChange,
}) => {
  return (
    <div className={styles.siwsRiskWarningContainer}>
      <Checkbox
        id="siws-message-checkbox"
        checked={checked}
        onChange={onChange}
        label="I understand the risk and would like to proceed."
        labelStyle={{
          color: "secondary",
          size: "xs",
          weight: "medium",
        }}
        checkboxContainerClassName={styles.siwsRiskWarningCheckBoxContainer}
        checkBoxInputContainerClassName={
          styles.siwsRiskWarningCheckBoxInputContainerClassName
        }
      />
    </div>
  );
};

export const SiwsRiskWarningBox = () => {
  return (
    <div className={styles.siwsRiskWarningBox}>
      <Typography size="xs" color="warning-primary" weight="medium">
        The URL requesting your signature differs from the current website. This
        may indicate a potential security risk.
      </Typography>
    </div>
  );
};
