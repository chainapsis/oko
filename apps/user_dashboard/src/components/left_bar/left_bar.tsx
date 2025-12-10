"use client";

import { type FC } from "react";
import cn from "classnames";
import { MenuItem } from "@oko-wallet/oko-common-ui/menu";
import { HomeOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/home_outlined";

import styles from "./left_bar.module.scss";
import { paths } from "@oko-wallet-user-dashboard/paths";
import { AccountInfoWithSubMenu } from "../account_info_with_sub_menu/account_info_with_sub_menu";
import { ExternalLinkItem } from "../external_link_item/external_link_item";
import { useViewState } from "@oko-wallet-user-dashboard/state/view";

export const LeftBar: FC = () => {
  const isLeftBarOpen = useViewState((state) => state.isLeftBarOpen);
  const toggleLeftBarOpen = useViewState((state) => state.toggleLeftBarOpen);

  return (
    <>
      <div
        className={cn(styles.overlay, { [styles.isOpen]: isLeftBarOpen })}
        onClick={toggleLeftBarOpen}
      />

      <div className={cn(styles.wrapper, { [styles.isOpen]: isLeftBarOpen })}>
        <ul className={styles.mainMenu}>
          <MenuItem
            href={paths.home}
            label="Home"
            Icon={
              <HomeOutlinedIcon
                color="var(--gray-400)"
                className={styles.icon}
              />
            }
            active={true}
          />
        </ul>

        <div className={styles.subMenu}>
          <AccountInfoWithSubMenu />

          <div>
            <ExternalLinkItem
              href={process.env.NEXT_PUBLIC_OKO_FEATURE_REQUEST_ENDPOINT}
            >
              Feature Request
            </ExternalLinkItem>

            <ExternalLinkItem
              href={process.env.NEXT_PUBLIC_OKO_GET_SUPPORT_ENDPOINT}
            >
              Get Support
            </ExternalLinkItem>
          </div>
        </div>
      </div>
    </>
  );
};
