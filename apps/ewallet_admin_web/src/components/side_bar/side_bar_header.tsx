import type { FC, PropsWithChildren } from "react";

import styles from "./side_bar_header.module.scss";

export const SideBarHeader: FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.wrapper}>{children}</div>;
};
