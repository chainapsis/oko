import { Logo } from "@oko-wallet/ewallet-common-ui/logo";

import styles from "./login_header.module.scss";

export const LoginHeader = (): React.ReactNode => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        {/* NOTE: theme is hardcoded to light for now */}
        <Logo theme={"light"} />
        <p className={styles.headerContentText}>Admin</p>
      </div>
    </div>
  );
};
