"use client";

import { useRouter } from "next/navigation";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import type { FC } from "react";
import { FormattedMessage } from "react-intl";

import styles from "./keyshare_nodes_view.module.scss";
import { paths } from "@oko-wallet-admin/paths";
import { KeyshareNodesTable } from "./keyshare_nodes_table";
import { TitleHeader } from "@oko-wallet-admin/components/title_header/title_header";
import { useAllKeyShareNodes } from "@oko-wallet-admin/fetch/ks_node/use_all_ks_nodes";
import { useGetTssAllActivationSetting } from "./use_get_tss_all_activation_setting";
import { useToggleTssAllActivation } from "./use_toggle_tss_all_activation";

export const KeyshareNodesHealthView: FC = () => {
  // const router = useRouter();
  //
  // const { data } = useAllKeyShareNodes();
  // const { data: tssAllActivationData } = useGetTssAllActivationSetting();
  // const toggleAllTssActivation = useToggleTssAllActivation();
  //
  // const handleToggleTssActivation = () => {
  //   const currentStatus =
  //     tssAllActivationData?.tss_activation_setting?.is_enabled;
  //
  //   if (currentStatus) {
  //     if (
  //       confirm(
  //         "Are you sure you want to deactivate all TSS features?\nThis will affect all users.",
  //       )
  //     ) {
  //       toggleAllTssActivation.mutate(!currentStatus);
  //     }
  //   } else {
  //     toggleAllTssActivation.mutate(!currentStatus);
  //   }
  // };
  //
  // const isActivated = tssAllActivationData?.tss_activation_setting?.is_enabled;

  return (
    <div className={styles.wrapper}>
      <TitleHeader title="Keyshare Node Health Checks" />
      <KeyshareNodesTable />
    </div>
  );
};
