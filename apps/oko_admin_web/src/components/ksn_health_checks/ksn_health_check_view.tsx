"use client";

import type { FC } from "react";

import styles from "./ksn_health_check_view.module.scss";
import { TitleHeader } from "@oko-wallet-admin/components/title_header/title_header";
import { KSNHealthCheckTable } from "./ksn_health_check_tbl";

export const KeyshareNodesHealthView: FC = () => {
  return (
    <div className={styles.wrapper}>
      <TitleHeader title="Keyshare Node Health Checks" />
      <KSNHealthCheckTable />
    </div>
  );
};
