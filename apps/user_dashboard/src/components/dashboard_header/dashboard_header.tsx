import type { Property } from "csstype";
import { Logo } from "@oko-wallet/oko-common-ui/logo";
import type { Theme } from "@oko-wallet/oko-common-ui/theme/theme_provider";
import type { FC } from "react";

import styles from "./dashboard_header.module.scss";

export const DashboardHeader: FC<{
  theme?: Theme;
  position?: Property.Position;
}> = ({ theme = "light", position = "static" }) => {
  return (
    <div className={styles.wrapper} style={{ position }}>
      <Logo theme={theme} />
    </div>
  );
};
