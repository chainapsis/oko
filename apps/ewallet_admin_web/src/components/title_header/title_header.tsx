import type { FC, ReactNode } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./title_header.module.scss";

interface TitleHeaderProps {
  title: string;
  totalCount?: number;
  renderRightContent?: () => ReactNode;
}

export const TitleHeader: FC<TitleHeaderProps> = ({
  title,
  totalCount,
  renderRightContent,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleWrapper}>
        <Typography
          color="primary"
          tagType="h1"
          className={styles.title}
          weight="bold"
          size="display-sm"
        >
          {title}
        </Typography>
        {totalCount !== undefined && (
          <p className={styles.titleSub}>{totalCount}</p>
        )}
      </div>
      {renderRightContent?.()}
    </div>
  );
};
