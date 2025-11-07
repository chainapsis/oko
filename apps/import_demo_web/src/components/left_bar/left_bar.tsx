"use client";

import { type FC } from "react";
import cn from "classnames";
import { MenuItem } from "@oko-wallet/oko-common-ui/menu";
import { HomeOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/home_outlined";

import styles from "./left_bar.module.scss";
import { BetaAccessCard } from "./beta_access_card/beta_access_card";
import { useViewState } from "@oko-wallet-import-demo-web/state/view";

export const LeftBar: FC = () => {
  const isLeftBarOpen = useViewState((state) => state.isLeftBarOpen);
  const toggleLeftBarOpen = useViewState((state) => state.toggleLeftBarOpen);

  return (
    <>
      <div
        className={cn(styles.overlay, { [styles.isOpen]: isLeftBarOpen })}
        onClick={toggleLeftBarOpen}
      />
      <ul className={cn(styles.wrapper, { [styles.isOpen]: isLeftBarOpen })}>
        <MenuItem
          href="/"
          label="Home"
          Icon={
            <HomeOutlinedIcon color="var(--gray-400)" className={styles.icon} />
          }
          active={true}
        />
        <BetaAccessCard />
      </ul>
    </>
  );
};
