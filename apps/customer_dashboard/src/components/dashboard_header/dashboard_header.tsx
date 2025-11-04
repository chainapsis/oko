import React from "react";
import { Logo } from "@oko-wallet/ewallet-common-ui/logo";

import styles from "./dashboard_header.module.scss";

export const DashboardHeader: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      {/* NOTE: theme is hardcoded to light for now */}
      <Logo theme={"light"} />
    </div>
  );
};
