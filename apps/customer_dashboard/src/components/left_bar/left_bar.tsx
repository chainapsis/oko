"use client";

import { MenuItem } from "@oko-wallet/oko-common-ui/menu";
import { HomeOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/home_outlined";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import { paths } from "@oko-wallet-ct-dashboard/paths";
import styles from "./left_bar.module.scss";
import { AccountInfoWithSubMenu } from "../account_info_with_sub_menu/account_info_with_sub_menu";
import { ExternalLinkItem } from "../external_link_item/external_link_item";
import { InfoModal } from "../info_modal/info_modal";

export const LeftBar = () => {
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
          <InfoModal
            title="Feature Request"
            content="Please reach out to our parternship channel."
            renderTrigger={({ onOpen }) => (
              <button className={styles.featureRequestButton} onClick={onOpen}>
                <Typography size="sm" weight="semibold" color="secondary">
                  Feature Request
                </Typography>
              </button>
            )}
          />

          <ExternalLinkItem href="https://oko-wallet.canny.io/bug-reports">
            Get Support
          </ExternalLinkItem>
        </div>
      </div>
    </div>
  );
};
