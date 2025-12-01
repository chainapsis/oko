import { FC } from "react";
import { Typography } from "@oko-wallet-common-ui/typography/typography";

import styles from "./sign_in_image.module.scss";

export const SignInImage: FC = () => (
  <div
    className={styles.container}
    style={{
      backgroundImage: `url(${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/assets/oko-user-dashboard-login.png)`,
    }}
  >
    <Typography tagType="h2" size="display-lg" weight="bold" color="white">
      Oko Home
    </Typography>
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
  </div>
);
