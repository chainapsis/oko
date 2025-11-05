import React from "react";
import styles from "./nav_item.module.scss";
import cn from "classnames";

export interface NavItemProps {
  onClick?: () => void;
  kind?: "trigger" | "menu";
  active?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const NavItem: React.FC<NavItemProps> = ({
  onClick,
  kind = "menu",
  active = false,
  icon,
  children,
}) => (
  <div
    className={cn(styles.wrapper, styles[kind], { [styles.active]: active })}
    onClick={onClick}
    tabIndex={0}
    role="button"
  >
    <div className={styles.content}>
      {icon}
      <span className={styles.text}>{children}</span>
    </div>
  </div>
);
