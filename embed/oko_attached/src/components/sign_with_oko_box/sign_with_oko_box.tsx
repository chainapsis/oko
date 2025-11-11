import React from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { OkoLogoIcon } from "@oko-wallet-common-ui/icons/oko_logo_icon";
import type { Theme } from "@oko-wallet/oko-common-ui/theme";

import styles from "./sign_with_oko_box.module.scss";

export const SignWithOkoBox: React.FC<SignWithOkoBoxProps> = ({
  theme,
  hideText,
}) => {
  return (
    <div className={styles.container}>
      {!hideText && (
        <Typography size="xs" color="quaternary" weight="medium">
          Sign with
        </Typography>
      )}
      <OkoLogoIcon width={37} height={14} theme={theme} />
    </div>
  );
};

export interface SignWithOkoBoxProps {
  theme: Theme | null;
  hideText?: boolean;
}
