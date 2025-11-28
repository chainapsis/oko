"use client";

import { DashboardHeader } from "@oko-wallet-user-dashboard/components/dashboard_header/dashboard_header";
import { SignUpDigits } from "@oko-wallet-user-dashboard/components/sign_up_digits/sign_up_digits";

import styles from "./page.module.scss";

export default function Page() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.headerContainer}>
        <DashboardHeader />
      </div>
      <div className={styles.inner}>
        <SignUpDigits />
      </div>
    </div>
  );
}
