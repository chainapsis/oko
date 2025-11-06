import { type FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { ChevronRightIcon } from "@oko-wallet/oko-common-ui/icons/chevron_right";

import styles from "./beta_access_card.module.scss";

const GET_EARLY_ACCESS_URL = "https://form.typeform.com/to/MxrBGq9b";

export const BetaAccessCard: FC = () => {
  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <div className={styles.titleRow}>
        <Typography size="sm" weight="semibold" color="primary">
          Join the Beta!
        </Typography>
      </div>
      <Typography
        size="sm"
        weight="regular"
        color="tertiary"
        className={styles.description}
      >
        Ready to bring this experience to your dApp? Apply for early access.
      </Typography>

      <img
        src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/assets/oko-beta-early-access.png`}
        className={styles.image}
      />

      <div className={styles.earlyAccessButton}>
        <Typography
          tagType="a"
          size="sm"
          weight="semibold"
          color="primary"
          href={GET_EARLY_ACCESS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Early Access
        </Typography>
        <ChevronRightIcon size={20} color="var(--fg-secondary)" />
      </div>
    </div>
  );
};
