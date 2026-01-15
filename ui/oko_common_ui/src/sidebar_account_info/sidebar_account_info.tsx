"use client";

import cn from "classnames";
import type { FC, ReactNode } from "react";

import { Typography } from "@oko-wallet-common-ui/typography/typography";

import styles from "./sidebar_account_info.module.scss";

export type SidebarAccountInfoProps = {
  className?: string;
  TopRightIcon?: ReactNode;
  email: string;
  label: string;
  logoImageUrl?: string;
};

export const SidebarAccountInfo: FC<SidebarAccountInfoProps> = ({
  className,
  TopRightIcon = null,
  email,
  label,
  logoImageUrl,
}) => {
  return (
    <div className={cn(styles.wrapper, className)}>
      {logoImageUrl ? (
        <img src={logoImageUrl} alt="avatar" />
      ) : (
        <Typography
          size="md"
          weight="semibold"
          color="quaternary"
          className={styles.fallbackImageText}
        >
          {label.slice(0, 2).toUpperCase()}
        </Typography>
      )}

      <div className={styles.detailInfo}>
        <span className={styles.topRightIcon}>{TopRightIcon}</span>
        <Typography size="sm" weight="semibold" color="primary">
          {label}
        </Typography>
        <Typography size="sm" color="tertiary" className={styles.userEmail}>
          {email}
        </Typography>
      </div>
    </div>
  );
};
