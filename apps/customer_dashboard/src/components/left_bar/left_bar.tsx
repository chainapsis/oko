"use client";

import type { FC } from "react";
import { MenuItem } from "@oko-wallet/oko-common-ui/menu";
import { HomeOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/home_outlined";

import { paths } from "@oko-wallet-ct-dashboard/paths";
import styles from "./left_bar.module.scss";
import { AccountInfoWithSubMenu } from "../account_info_with_sub_menu/account_info_with_sub_menu";
import { ExternalLinkItem } from "../external_link_item/external_link_item";

export const LeftBar: FC = () => {
  return (
    <div className={styles.wrapper}>
      <ul className={styles.mainMenu}>
        <MenuItem
          href={paths.home}
          label="Home"
          Icon={
            <HomeOutlinedIcon color="var(--gray-400)" className={styles.icon} />
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
  );
};
