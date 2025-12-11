import type { FC } from "react";
import cn from "classnames";
import Image from "next/image";

import styles from "./whole_page_loading.module.scss";
import { Spinner } from "../spinner/spinner";
import { DashboardHeader } from "@oko-wallet-user-dashboard/components/dashboard_header/dashboard_header";
import { SignInImage } from "@oko-wallet-user-dashboard/components/sign_in_image/sign_in_image";
import { Typography } from "@oko-wallet-common-ui/typography/typography";

export const WholePageLoading: FC = () => {
  const description =
    "Everything you hold, all in one place. \n Check your balances, addresses, \n and connected apps at a glance.";

  return (
    <>
      <div className={cn(styles.wrapper, styles.desktop)}>
        <DashboardHeader theme="dark" position="absolute" />
        <div className={styles.body}>
          <SignInImage>
            <div className={styles.inner}>
              <Image
                src="/oko_home.svg"
                alt="Oko Home"
                width={231.78}
                height={36}
                className={styles.title}
              />
              <Typography
                tagType="p"
                size="xl"
                weight="medium"
                color="white"
                className={styles.description}
              >
                {description}
              </Typography>
            </div>
          </SignInImage>
          <div className={styles.content}>
            <Spinner size={30} />
          </div>
        </div>
      </div>

      <div className={cn(styles.wrapper, styles.mobile)}>
        <SignInImage>
          <div className={styles.spinnerWrapper}>
            <Spinner size={30} />
          </div>
        </SignInImage>
      </div>
    </>
  );
};
