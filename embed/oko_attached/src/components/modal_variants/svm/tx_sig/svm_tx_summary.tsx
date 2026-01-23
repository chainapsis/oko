import { Skeleton } from "@oko-wallet/oko-common-ui/skeleton";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { SvmTxSignPayload } from "@oko-wallet/oko-sdk-core";
import { type FC, type ReactNode, useMemo } from "react";

import { Instructions } from "./msg/instructions";
import { TransactionSummaryFrame } from "@oko-wallet-attached/components/modal_variants/common/transaction_summary";
import { TxRow } from "@oko-wallet-attached/components/modal_variants/common/tx_row";
import { TxContainer } from "@oko-wallet-attached/components/modal_variants/eth/tx_sig/actions/common/tx_container";
import type { ParsedTransaction } from "@oko-wallet-attached/tx-parsers/svm";

export interface SvmTxSummaryProps {
  payload: SvmTxSignPayload;
  parsedTx: ParsedTransaction | null;
  parseError: string | null;
  isLoading: boolean;
}

export const SvmTxSummary: FC<SvmTxSummaryProps> = ({
  payload,
  parsedTx,
  parseError,
  isLoading,
}) => {
  const txData = payload.data;

  const instructionCount = parsedTx?.instructions.length ?? 0;

  const { rawData, smartViewContent } = useMemo(() => {
    let content: ReactNode;

    if (parseError) {
      content = (
        <TxContainer>
          <TxRow label="Error">
            <Typography color="primary" size="sm" weight="semibold">
              {parseError}
            </Typography>
          </TxRow>
        </TxContainer>
      );
    } else if (isLoading || !parsedTx) {
      content = (
        <TxContainer>
          <Skeleton width="100%" height="32px" />
        </TxContainer>
      );
    } else {
      content = <Instructions instructions={parsedTx.instructions} />;
    }

    return {
      rawData: JSON.stringify(
        {
          serialized_transaction: txData.serialized_transaction,
          message_to_sign: txData.message_to_sign,
          is_versioned: txData.is_versioned,
        },
        null,
        2,
      ),
      smartViewContent: content,
    };
  }, [txData, parsedTx, parseError, isLoading]);

  return (
    <TransactionSummaryFrame
      count={instructionCount}
      countLabel=" Message(s)"
      rawData={rawData}
      smartContent={smartViewContent}
    />
  );
};
