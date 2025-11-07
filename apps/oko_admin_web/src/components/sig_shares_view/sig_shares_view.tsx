"use client";

import React from "react";

import styles from "./sig_shares_view.module.scss";
import { SigSharesTable } from "./sig_shares_table";
import { TitleHeader } from "@oko-wallet-admin/components/title_header/title_header";

export const SigSharesView: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <TitleHeader title="Sig History" />
      <SigSharesTable />
    </div>
  );
};
