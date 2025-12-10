import { type FC, type ReactNode } from "react";

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
    {children}
  </div>
);
