"use client";

import styles from "./page.module.scss";
import { DashboardHeader } from "@oko-wallet-ct-dashboard/components/dashboard_header/dashboard_header";
import { SignUpDigits } from "@oko-wallet-ct-dashboard/components/sign_up_digits/sign_up_digits";

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
