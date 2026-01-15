import Link from "next/link";
import type { FC } from "react";

import { ArrowRightOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/arrow_right_outlined";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./home_banner.module.scss";

export type HomeBannerProps = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  type: "docs" | "demo";
};

export const HomeBanner: FC<HomeBannerProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
  type,
}: HomeBannerProps) => {
  return (
    <Link href={buttonLink} className={styles.wrapper} target="_blank">
      <img
        src={`/home_banner_${type}.png`}
        width={144}
        height={88}
        alt={`${type} banner`}
      />
      <div>
        <Typography tagType="h3" size="md" weight="semibold" color="primary">
          {title}
        </Typography>
        <Spacing height={4} />

        <Typography size="sm" weight="regular" customColor="gray-600">
          {description}
        </Typography>
        <Typography
          tagType="span"
          size="md"
          weight="semibold"
          color="brand-secondary"
          className={styles.button}
        >
          {buttonText}
          <ArrowRightOutlinedIcon
            color="var(--fg-brand-secondary)"
            className={styles.buttonIcon}
          />
        </Typography>
      </div>
    </Link>
  );
};
