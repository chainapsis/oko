import styles from "./page.module.scss";
import { SignInForm } from "@oko-wallet-user-dashboard/components/sign_in_form/sign_in_form";
import { DashboardHeader } from "@oko-wallet-user-dashboard/components/dashboard_header/dashboard_header";

export default function Page() {
  return (
    <div className={styles.wrapper}>
      <DashboardHeader />

      <div className={styles.body}>
        <div className={styles.formFrame}>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
