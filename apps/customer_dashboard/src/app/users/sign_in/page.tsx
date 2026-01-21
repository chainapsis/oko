import styles from "./page.module.scss";
import { DashboardHeader } from "@oko-wallet-ct-dashboard/components/dashboard_header/dashboard_header";
import { SignInForm } from "@oko-wallet-ct-dashboard/components/sign_in_form/sign_in_form";

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
