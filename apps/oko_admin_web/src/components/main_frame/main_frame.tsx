import type { ReactNode } from "react";

import styles from "./main_frame.module.scss";

export const MainFrame = ({ children }: { children: ReactNode }) => {
  return <div className={styles.wrapper}>{children}</div>;
};
