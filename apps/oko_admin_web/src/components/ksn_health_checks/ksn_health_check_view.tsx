"use client";

import { useRouter } from "next/navigation";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { useState, type FC } from "react";

import styles from "./keyshare_nodes_view.module.scss";
import { TitleHeader } from "@oko-wallet-admin/components/title_header/title_header";
import { useKSNHealthChecks } from "@oko-wallet-admin/fetch/ks_node/use_ksn_health_checks";
import { KeyshareNodesTable } from "@oko-wallet-admin/components/keyshare_nodes/keyshare_nodes_table";

export const KeyshareNodesHealthView: FC = () => {
  const [pageIdx, setPageIdx] = useState(0);

  const { data } = useKSNHealthChecks(pageIdx);

  console.log(1, data);

  return (
    <div className={styles.wrapper}>
      <TitleHeader title="Keyshare Node Health Checks" />
      <KeyshareNodesTable />
    </div>
  );
};
