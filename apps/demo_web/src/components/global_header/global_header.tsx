"use client";

import React, { type FC } from "react";
import { Logo } from "@oko-wallet/ewallet-common-ui/logo";
import { MenuIcon } from "@oko-wallet/ewallet-common-ui/icons/menu";
import { XCloseIcon } from "@oko-wallet/ewallet-common-ui/icons/x_close";

import styles from "./global_header.module.scss";
import { useViewState } from "@oko-wallet-demo-web/state/view";

export const GlobalHeader: FC = () => {
  const isLeftBarOpen = useViewState((state) => state.isLeftBarOpen);
  const toggleLeftBarOpen = useViewState((state) => state.toggleLeftBarOpen);

  return (
    <div className={styles.wrapper}>
      <span className={styles.menuIconWrapper} onClick={toggleLeftBarOpen}>
        {isLeftBarOpen ? (
          <XCloseIcon color="var(--fg-primary)" size={24} />
        ) : (
          <MenuIcon color="var(--fg-primary)" size={24} />
        )}
      </span>
      {/* NOTE: theme is hardcoded to light for now */}
      <Logo className={styles.logoResponsive} theme={"light"} />
    </div>
  );
};
