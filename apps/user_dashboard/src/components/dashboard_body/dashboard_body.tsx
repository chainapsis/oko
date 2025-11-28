import { PropsWithChildren, FC } from "react";
import cn from "classnames";

import styles from "./dashboard_body.module.scss";

export const DashboardBody: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles.wrapper}>
      <div className={cn(styles.inner, "hide-scrollbar")}>{children}</div>
    </div>
  );
};
