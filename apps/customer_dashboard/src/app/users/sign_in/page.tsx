import styles from "./page.module.scss";
import { SignInForm } from "@oko-wallet-ct-dashboard/components/sign_in_form/sign_in_form";
import { DashboardHeader } from "@oko-wallet-ct-dashboard/components/dashboard_header/dashboard_header";

export default function Page() {
  return (
    <div className={styles.wrapper}>
      <DashboardHeader />

      <div className={styles.body}>
        <div className={styles.rectangleSection}></div>
        <SignInForm />
      </div>
    </div>
  );
}
