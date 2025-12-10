import type { FC } from "react";

import styles from "./whole_page_loading.module.scss";
import { Spinner } from "../spinner/spinner";
import { DashboardHeader } from "@oko-wallet-user-dashboard/components/dashboard_header/dashboard_header";
import { SignInImage } from "@oko-wallet-user-dashboard/components/sign_in_image/sign_in_image";

export const WholePageLoading: FC = () => {
  return (
    <div className={styles.wrapper}>
      <DashboardHeader theme="dark" position="absolute" />
      <div className={styles.body}>
        <SignInImage />
        <div className={styles.content}>
          <Spinner size={30} />
        </div>
      </div>
    </div>
  );
};
