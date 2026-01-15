import { type FC } from "react";
import { Logo } from "@oko-wallet/oko-common-ui/logo";

import styles from "./global_header.module.scss";

export const GlobalHeader: FC = () => {
  return (
    <div className={styles.wrapper}>
      {/* NOTE: theme is hardcoded to light for now */}
      <Logo theme={"light"} />
    </div>
  );
};
