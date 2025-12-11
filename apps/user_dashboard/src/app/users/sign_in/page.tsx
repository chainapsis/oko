import type { FC, ReactNode } from "react";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { OkoLogoIcon } from "@oko-wallet-common-ui/icons/oko_logo_icon";

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
          <SignInImage>
            <InnerContent />
          </SignInImage>
          <div className={styles.content}>
            <AccountWidget />
          </div>
        </div>
      </div>

      <div className={styles.mobileWrapper}>
        <SignInImage>
          <InnerContent>
            <AccountWidget />
          </InnerContent>
        </SignInImage>
      </div>
    </>
  );
}

const InnerContent: FC<{ children?: ReactNode }> = ({ children }) => (
  <div className={styles.inner}>
    <Typography
      tagType="h2"
      size="display-lg"
      weight="bold"
      color="white"
      className={styles.title}
    >
      Oko Home
    </Typography>

    <OkoLogoIcon className={styles.mobileLogo} width={58} height={22} />

    <Typography
      tagType="p"
      size="lg"
      weight="bold"
      color="white"
      className={styles.description}
    >
      Everything you hold, all in one place. <br />
      Check your balances, addresses, <br /> and connected apps at a glance.
    </Typography>

    {children}
  </div>
);
