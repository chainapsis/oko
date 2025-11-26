"use client";

import { useState, type FC } from "react";

import styles from "./ksn_health_check_view.module.scss";
import { TitleHeader } from "@oko-wallet-admin/components/title_header/title_header";
import { KSNHealthCheckTable } from "./ksn_health_check_tbl";
// import { useKSNHealthChecks } from "@oko-wallet-admin/fetch/ks_node/use_ksn_health_checks";
// import { KeyshareNodesTable } from "@oko-wallet-admin/components/keyshare_nodes/keyshare_nodes_table";

export const KeyshareNodesHealthView: FC = () => {
  // const [pageIdx, setPageIdx] = useState(0);

  return (
    <div className={styles.wrapper}>
      <TitleHeader title="Keyshare Node Health Checks" />
      <KSNHealthCheckTable />
    </div>
  );
};
