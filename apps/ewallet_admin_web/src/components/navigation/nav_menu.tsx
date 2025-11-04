import React from "react";

import styles from "./nav_menu.module.scss";

export const NavMenu: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className={styles.wrapper}>{children}</div>;
};
