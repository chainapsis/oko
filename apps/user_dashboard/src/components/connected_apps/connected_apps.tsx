import { type FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { ImageWithAlt } from "@oko-wallet/oko-common-ui/image_with_alt";

import styles from "./connected_apps.module.scss";

export const ConnectedApps: FC = () => {
  //TODO: remove this after Connected-App feature is implemented
  const isEmpty = true;

  const emptyImage = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/assets/oko_user_dashboard_connected_app_empty.webp`;
  const emptyImageAlt = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/assets/oko_user_dashboard_connected_app_empty.png`;

  return (
    <div>
      <Typography tagType="h1" size="xl" weight="semibold" color="primary">
        Connected Apps
      </Typography>

      {isEmpty && (
        <div className={styles.emptyState}>
          {isEmpty && (
            <div className={styles.emptyImageWrapper}>
              <ImageWithAlt
                srcSet={emptyImage}
                srcAlt={emptyImageAlt}
                alt="Empty Connected Apps Image"
                className={styles.emptyImage}
              />
            </div>
          )}
          <Typography tagType="p" size="sm" weight="semibold" color="tertiary">
            No Connected Apps Yet
          </Typography>
          <Typography tagType="p" size="sm" weight="medium" color="quaternary">
            Log in to an app with Oko to see it here.
          </Typography>
        </div>
      )}
    </div>
  );
};
