import styles from "./page.module.scss";
import { AccountWidget } from "@oko-wallet-user-dashboard/components/widgets/account_widget/account_widget";
import { DashboardHeader } from "@oko-wallet-user-dashboard/components/dashboard_header/dashboard_header";
import { SignInImage } from "@oko-wallet-user-dashboard/components/sign_in_image/sign_in_image";

export default function Page() {
  return (
    <>
      <div className={styles.desktopWrapper}>
        <DashboardHeader theme="dark" position="absolute" />
        <div className={styles.body}>
          <SignInImage />
          <div className={styles.content}>
            <AccountWidget />
          </div>
        </div>
      </div>

      <div className={styles.mobileWrapper}>
        <SignInImage>
          <AccountWidget />
        </SignInImage>
      </div>
    </>
  );
}
