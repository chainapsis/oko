import { type FC, type ReactNode } from "react";

import { S3_BUCKET_URL } from "@oko-wallet-user-dashboard/fetch";
import styles from "./sign_in_image.module.scss";

export interface SignInImageProps {
  children?: ReactNode;
}

export const SignInImage: FC<SignInImageProps> = ({ children }) => (
  <div
    className={styles.container}
    style={{
      backgroundImage: `url(${S3_BUCKET_URL}/assets/oko-user-dashboard-login.png)`,
    }}
  >
    {children}
  </div>
);
