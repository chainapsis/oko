"use client";

import React from "react";
import cn from "classnames";

import styles from "./preview_panel.module.scss";
import { LoginWidget } from "@/components/widgets/login_widget/login_widget";
import { EthereumOnchainSignWidget } from "@/components/widgets/ethereum_onchain_sign_widget/ethereum_onchain_sign_widget";
import { CosmosOnchainSignWidget } from "@/components/widgets/cosmos_onchain_sign_widget/cosmos_onchain_sign_widget";

export const PreviewPanel = () => {
  return (
    <div className={styles.wrapper}>
      <div className={cn(styles.inner, "common-list-scroll")}>
        <div className={styles.col}>
          <LoginWidget />
        </div>
        <div className={styles.col}>
          <h2>Ethereum</h2>
          <EthereumOnchainSignWidget />
        </div>
        <div className={styles.col}>
          <h2>Cosmos</h2>
          <CosmosOnchainSignWidget />
        </div>
        <div className={styles.col}></div>
      </div>
    </div>
  );
};
