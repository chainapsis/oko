"use client";

import React, { useEffect, useState } from "react";
import cn from "classnames";
import { useRouter } from "next/navigation";
import { Typography } from "@oko-wallet/ewallet-common-ui/typography";
import { Spacing } from "@oko-wallet/ewallet-common-ui/spacing";
import { ChevronLeftIcon } from "@oko-wallet/ewallet-common-ui/icons/chevron_left";

import { ResetPassword } from "@oko-wallet-ct-dashboard/components/reset_password/reset_password";
import { DashboardHeader } from "@oko-wallet-ct-dashboard/components/dashboard_header/dashboard_header";
import styles from "./page.module.scss";
import { Authorized } from "@oko-wallet-ct-dashboard/components/authorized/authorized";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isAfterLogin, setIsAfterLogin] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const afterLogin = urlParams.get("after_login") === "true";
    setIsAfterLogin(afterLogin);
  }, []);

  return (
    <Authorized>
      <div className={styles.wrapper}>
        <DashboardHeader />
        <div className={cn(styles.body, { [styles.afterLogin]: isAfterLogin })}>
          {isAfterLogin && (
            <button className={styles.backButton} onClick={() => router.back()}>
              <ChevronLeftIcon size={24} color="var(--fg-tertiary)" />
            </button>
          )}

          <Typography
            tagType="h1"
            size="display-sm"
            weight="semibold"
            color="primary"
          >
            {isAfterLogin ? "Change" : "Reset"} Password
          </Typography>
          <Spacing height={8} />

          <Typography
            size="md"
            weight="regular"
            color="secondary"
            className={styles.description}
          >
            Time for a fresh, secure password
          </Typography>

          <ResetPassword />
        </div>
      </div>
    </Authorized>
  );
}
