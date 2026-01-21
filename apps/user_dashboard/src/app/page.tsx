import { ToastCloseButton } from "@oko-wallet-common-ui/toast/toast";
import { Authorized } from "@oko-wallet-user-dashboard/components/authorized/authorized";
import { DashboardBody } from "@oko-wallet-user-dashboard/components/dashboard_body/dashboard_body";
import { LeftBar } from "@oko-wallet-user-dashboard/components/left_bar/left_bar";
import { DashboardHeader } from "@oko-wallet-user-dashboard/components/dashboard_header/dashboard_header";
import { ConnectedApps } from "@oko-wallet-user-dashboard/components/connected_apps/connected_apps";
import { TotalBalance } from "@oko-wallet-user-dashboard/components/total_balance/total_balance";
import { MyAssets } from "@oko-wallet-user-dashboard/components/my_assets/my_assets";
import { ToastContainer } from "@oko-wallet-user-dashboard/components/toast";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <Authorized>
      <div className={styles.wrapper}>
        <DashboardHeader />
        <div className={styles.body}>
          <LeftBar />
          <DashboardBody>
            <div className={styles.content}>
              <ConnectedApps />
              <TotalBalance />
              <MyAssets />
            </div>
          </DashboardBody>
        </div>
      </div>
      <ToastContainer />
    </Authorized>
  );
}
