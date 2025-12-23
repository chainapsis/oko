import { type FC, type ReactNode, useState, useMemo } from "react";
import type { MakeSolanaSigData } from "@oko-wallet/oko-sdk-core";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { ChevronRightIcon } from "@oko-wallet/oko-common-ui/icons/chevron_right";

import styles from "./sol_tx_summary.module.scss";
import { MakeSignatureRawCodeBlock } from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_sig_modal_code_block";
import { MakeSignatureRawCodeBlockContainer } from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_sig_modal_code_block_container";
import { TxContainer } from "@oko-wallet-attached/components/modal_variants/eth/tx_sig/actions/common/tx_container";
import { TxRow } from "@oko-wallet-attached/components/modal_variants/common/tx_row";

export interface SolanaTxSummaryProps {
  data: MakeSolanaSigData;
}

export const SolanaTxSummary: FC<SolanaTxSummaryProps> = ({ data }) => {
  const [isRawView, setIsRawView] = useState(false);

  const signType = data.sign_type;

  const { headerText, rawData, smartViewContent } = useMemo(() => {
    if (signType === "tx") {
      const txData = data.payload.data as {
        serialized_transaction: string;
        message_to_sign: string;
        is_versioned: boolean;
      };
      const msgBytes = atob(txData.message_to_sign);

      return {
        headerText: "Transaction",
        rawData: JSON.stringify(
          {
            serialized_transaction: txData.serialized_transaction,
            message_to_sign: txData.message_to_sign,
            is_versioned: txData.is_versioned,
          },
          null,
          2,
        ),
        smartViewContent: (
          <TxContainer>
            <TxRow label="Type">
              <Typography color="primary" size="sm" weight="semibold">
                {txData.is_versioned ? "Versioned Transaction" : "Legacy Transaction"}
              </Typography>
            </TxRow>
            <TxRow label="Size">
              <Typography color="primary" size="sm" weight="semibold">
                {msgBytes.length} bytes
              </Typography>
            </TxRow>
          </TxContainer>
        ),
      };
    } else if (signType === "message") {
      const msgData = data.payload.data as { message: string };
      let decodedMessage = "";
      let messageBytes = 0;

      try {
        const hex = msgData.message.startsWith("0x")
          ? msgData.message.slice(2)
          : msgData.message;
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        messageBytes = bytes.length;
        decodedMessage = new TextDecoder().decode(bytes);
      } catch {
        messageBytes = msgData.message.length / 2;
        decodedMessage = msgData.message;
      }

      return {
        headerText: "Message",
        rawData: JSON.stringify({ message: msgData.message }, null, 2),
        smartViewContent: (
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
                {decodedMessage.length > 200
                  ? decodedMessage.slice(0, 200) + "..."
                  : decodedMessage}
              </Typography>
            </TxRow>
            <TxRow label="Size">
              <Typography color="primary" size="sm" weight="semibold">
                {messageBytes} bytes
              </Typography>
            </TxRow>
          </TxContainer>
        ),
      };
    } else {
      // all_tx
      const allTxData = data.payload.data as {
        serialized_transactions: string[];
        is_versioned: boolean;
      };
      const count = allTxData.serialized_transactions.length;

      return {
        headerText: `${count} Transactions`,
        rawData: JSON.stringify(
          {
            serialized_transactions: allTxData.serialized_transactions,
            is_versioned: allTxData.is_versioned,
          },
          null,
          2,
        ),
        smartViewContent: (
          <TxContainer>
            <TxRow label="Batch">
              <Typography color="primary" size="sm" weight="semibold">
                {count} transactions
              </Typography>
            </TxRow>
            <TxRow label="Type">
              <Typography color="primary" size="sm" weight="semibold">
                {allTxData.is_versioned ? "Versioned" : "Legacy"}
              </Typography>
            </TxRow>
          </TxContainer>
        ),
      };
    }
  }, [signType, data.payload.data]);

  function handleToggleView() {
    setIsRawView((prev) => !prev);
  }

  let content: ReactNode | null = null;

  if (isRawView) {
    content = (
      <MakeSignatureRawCodeBlockContainer>
        <MakeSignatureRawCodeBlock className={styles.codeBlock} code={rawData} />
      </MakeSignatureRawCodeBlockContainer>
    );
  } else {
    content = smartViewContent;
  }

  return (
    <div className={styles.txSummaryContainer}>
      <div className={styles.txSummaryHeader}>
        <Typography color="secondary" size="sm" weight="semibold">
          {headerText}
        </Typography>
        <div className={styles.txSummaryHeaderRight} onClick={handleToggleView}>
          <Typography color="tertiary" size="xs" weight="medium">
            {isRawView ? "Smart View" : "Raw View"}
          </Typography>
          <ChevronRightIcon className={styles.txSummaryHeaderRightIcon} />
        </div>
      </div>
      {content}
    </div>
  );
};
