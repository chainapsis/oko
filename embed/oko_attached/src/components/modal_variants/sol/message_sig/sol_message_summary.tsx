import { type FC, type ReactNode, useMemo, useState } from "react";

import { ChevronRightIcon } from "@oko-wallet/oko-common-ui/icons/chevron_right";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { SolanaMessageSignPayload } from "@oko-wallet/oko-sdk-core";
import { MakeSignatureRawCodeBlock } from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_sig_modal_code_block";
import { MakeSignatureRawCodeBlockContainer } from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_sig_modal_code_block_container";
import { TxRow } from "@oko-wallet-attached/components/modal_variants/common/tx_row";
import { TxContainer } from "@oko-wallet-attached/components/modal_variants/eth/tx_sig/actions/common/tx_container";

import styles from "../common/summary.module.scss";

export interface SolanaMessageSummaryProps {
  payload: SolanaMessageSignPayload;
}

export const SolanaMessageSummary: FC<SolanaMessageSummaryProps> = ({
  payload,
}) => {
  const [isRawView, setIsRawView] = useState(false);

  const { rawData, smartViewContent } = useMemo(() => {
    const msgData = payload.data;
    let decoded = "";

    try {
      const hex = msgData.message.startsWith("0x")
        ? msgData.message.slice(2)
        : msgData.message;
      const byteArray = new Uint8Array(hex.length / 2);
      for (let i = 0; i < byteArray.length; i++) {
        byteArray[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      }
      decoded = new TextDecoder().decode(byteArray);
    } catch {
      decoded = msgData.message;
    }

    const content: ReactNode = (
      <TxContainer>
        <TxRow label="Content">
          <Typography
            color="primary"
            size="sm"
            weight="semibold"
            style={{
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {decoded.length > 200 ? decoded.slice(0, 200) + "..." : decoded}
          </Typography>
        </TxRow>
      </TxContainer>
    );

    return {
      rawData: JSON.stringify({ message: msgData.message }, null, 2),
      smartViewContent: content,
    };
  }, [payload.data]);

  function handleToggleView() {
    setIsRawView((prev) => !prev);
  }

  let content: ReactNode | null = null;

  if (isRawView) {
    content = (
      <MakeSignatureRawCodeBlockContainer>
        <MakeSignatureRawCodeBlock
          className={styles.codeBlock}
          code={rawData}
        />
      </MakeSignatureRawCodeBlockContainer>
    );
  } else {
    content = smartViewContent;
  }

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryHeader}>
        <Typography color="secondary" size="sm" weight="semibold">
          Message
        </Typography>
        <div className={styles.summaryHeaderRight} onClick={handleToggleView}>
          <Typography color="tertiary" size="xs" weight="medium">
            {isRawView ? "Smart View" : "Raw View"}
          </Typography>
          <ChevronRightIcon className={styles.summaryHeaderRightIcon} />
        </div>
      </div>
      {content}
    </div>
  );
};
