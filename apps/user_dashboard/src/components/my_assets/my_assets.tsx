"use client";

import { FC } from "react";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { SettingIcon } from "@oko-wallet-common-ui/icons/setting_icon";

import styles from "./my_assets.module.scss";
import { ShowHideChainsModal } from "@oko-wallet-user-dashboard/components/show_hide_chains_modal/show_hide_chains_modal";
import { TokenList } from "./components/token_list/token_list";

export const MyAssets: FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Typography tagType="h1" size="xl" weight="semibold" color="primary">
          My Assets
        </Typography>

        <ShowHideChainsModal
          renderTrigger={({ onOpen }) => (
            <div className={styles.showHideChains} onClick={onOpen}>
              <SettingIcon size={16} color="var(--fg-quaternary)" />
              <Typography size="sm" weight="semibold" color="tertiary">
                Show/Hide Chains
              </Typography>
            </div>
          )}
        />
      </div>

      <TokenList />
    </div>
  );
};
