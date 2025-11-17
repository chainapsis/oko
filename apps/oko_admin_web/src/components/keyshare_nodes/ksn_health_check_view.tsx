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
  const { data } = useAllKeyShareNodes();
  // const { data: tssAllActivationData } = useGetTssAllActivationSetting();
  // const toggleAllTssActivation = useToggleTssAllActivation();

  return (
    <div className={styles.wrapper}>
      <TitleHeader title="Keyshare Node Health Checks" />
      <KeyshareNodesTable />
    </div>
  );
};
