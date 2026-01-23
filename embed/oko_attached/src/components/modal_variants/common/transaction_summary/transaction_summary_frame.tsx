import { ChevronRightIcon } from "@oko-wallet/oko-common-ui/icons/chevron_right";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { type FC, type ReactNode, useState } from "react";

import styles from "./transaction_summary.module.scss";
import { MakeSignatureRawCodeBlock } from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_sig_modal_code_block";
import { MakeSignatureRawCodeBlockContainer } from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_sig_modal_code_block_container";

export interface TransactionSummaryFrameProps {
  count: number;
  countLabel: string;
  rawData: string;
  smartContent: ReactNode;
}

export const TransactionSummaryFrame: FC<TransactionSummaryFrameProps> = ({
  count,
  countLabel,
  rawData,
  smartContent,
}) => {
  const [isRawView, setIsRawView] = useState(false);

  function handleToggleView() {
    setIsRawView((prev) => !prev);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleView();
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.countBadge}>
          <Typography color="primary" size="xs" weight="semibold">
            {count}
          </Typography>
          <Typography color="secondary" size="xs" weight="semibold">
            {countLabel}
          </Typography>
        </div>
        <div
          className={styles.toggleButton}
          onClick={handleToggleView}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        >
          <Typography color="tertiary" size="xs" weight="medium">
            {isRawView ? "Smart View" : "Raw View"}
          </Typography>
          <ChevronRightIcon className={styles.toggleIcon} />
        </div>
      </div>
      {isRawView ? (
        <MakeSignatureRawCodeBlockContainer>
          <MakeSignatureRawCodeBlock code={rawData} />
        </MakeSignatureRawCodeBlockContainer>
      ) : (
        smartContent
      )}
    </div>
  );
};
