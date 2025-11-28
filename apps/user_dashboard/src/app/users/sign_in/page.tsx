import styles from "./page.module.scss";
import { DashboardHeader } from "@oko-wallet-user-dashboard/components/dashboard_header/dashboard_header";
import { SignInForm } from "@oko-wallet-user-dashboard/components/sign_in_form/sign_in_form";
import { SignInImage } from "@oko-wallet-user-dashboard/components/sign_in_image/sign_in_image";

export default function Page() {
  return (
    <div className={styles.wrapper}>
      <DashboardHeader theme="dark" position="absolute" />
      <div className={styles.body}>
        <SignInImage />
        <div className={styles.content}>
          <div className={styles.formFrame}>
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}
