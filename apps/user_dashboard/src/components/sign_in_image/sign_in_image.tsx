import { type FC, type ReactNode } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { OkoLogoIcon } from "@oko-wallet/oko-common-ui/icons/oko_logo_icon";

import styles from "./sign_in_image.module.scss";

export interface SignInImageProps {
  children?: ReactNode;
}

export const SignInImage: FC<SignInImageProps> = ({ children }) => (
  <div
    className={styles.container}
    style={{
      backgroundImage: `url(${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/assets/oko-user-dashboard-login.png)`,
    }}
  >
    <Typography
      tagType="h2"
      size="display-lg"
      weight="bold"
      color="white"
      className={styles.title}
    >
      Oko Home
    </Typography>

    <OkoLogoIcon className={styles.logo} width={58} height={22} />

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
