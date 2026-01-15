"use client";

import { useRouter } from "next/navigation";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { ChevronLeftIcon } from "@oko-wallet/oko-common-ui/icons/chevron_left";

import { DashboardHeader } from "@oko-wallet-ct-dashboard/components/dashboard_header/dashboard_header";
import { Authorized } from "@oko-wallet-ct-dashboard/components/authorized/authorized";
import { EditInfoForm } from "@oko-wallet-ct-dashboard/components/edit_info_form/edit_info_form";
import styles from "./page.module.scss";

export default function EditInfoPage() {
  const router = useRouter();

  return (
    <Authorized>
      <div className={styles.wrapper}>
        <DashboardHeader />
        <div className={styles.body}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <ChevronLeftIcon size={24} color="var(--fg-tertiary)" />
          </button>

          <Typography
            tagType="h1"
            size="display-sm"
            weight="semibold"
            color="primary"
          >
            Edit App Information
          </Typography>
          <Spacing height={8} />

          <Typography
            size="md"
            weight="regular"
            color="secondary"
            className={styles.description}
          >
            Update your app name and logo
          </Typography>

          <EditInfoForm />
        </div>
      </div>
    </Authorized>
  );
}
