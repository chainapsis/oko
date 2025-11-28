import React from "react";

import styles from "./page.module.scss";
import { Authorized } from "@oko-wallet-user-dashboard/components/authorized/authorized";
import { DashboardBody } from "@oko-wallet-user-dashboard/components/dashboard_body/dashboard_body";
import { LeftBar } from "@oko-wallet-user-dashboard/components/left_bar/left_bar";
import { DashboardHeader } from "@oko-wallet-user-dashboard/components/dashboard_header/dashboard_header";

export default function Home() {
  return (
    <Authorized>
      <div className={styles.wrapper}>
        <DashboardHeader />
        <div className={styles.body}>
          <LeftBar />
          <DashboardBody></DashboardBody>
        </div>
      </div>
    </Authorized>
  );
}
