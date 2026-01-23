import type { FC, ReactNode } from "react";
import type { ParsedInstruction } from "@oko-wallet-attached/tx-parsers/svm";
import { Skeleton } from "@oko-wallet/oko-common-ui/skeleton";

import styles from "./instructions.module.scss";
import { SvmTransferPretty } from "./transfer/transfer";
import { TokenTransferPretty } from "./transfer/token_transfer";
import { UnknownInstruction } from "./unknown/unknown";

function renderInstruction(
  instruction: ParsedInstruction,
  index: number,
): ReactNode {
  const { programId, instructionName, data, accounts } = instruction;

  // System Program - SOL Transfer
  if (programId === "11111111111111111111111111111111") {
    if (instructionName === "transfer") {
      const lamports = data.lamports as bigint | number | undefined;
      const to = accounts[1]?.pubkey;

      if (lamports !== undefined) {
        return <SvmTransferPretty key={index} lamports={lamports} to={to} />;
      }
    }
  }

  // Token Program - Token Transfer
  if (
    programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ||
    programId === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
  ) {
    // transferChecked: source, mint, destination, owner
    if (instructionName === "transferChecked") {
      const amount = data.amount as bigint | number | undefined;
      const decimals = data.decimals as number | undefined;
      const mint = accounts[1]?.pubkey;
      const to = accounts[2]?.pubkey;

      if (amount !== undefined) {
        return (
          <TokenTransferPretty
            key={index}
            amount={amount}
            decimals={decimals}
            mint={mint}
            to={to}
          />
        );
      }
    }

    // transfer: source, destination, owner (no mint in accounts)
    if (instructionName === "transfer") {
      const amount = data.amount as bigint | number | undefined;
      const to = accounts[1]?.pubkey;

      if (amount !== undefined) {
        return <TokenTransferPretty key={index} amount={amount} to={to} />;
      }
    }

    return <UnknownInstruction key={index} instruction={instruction} />;
  }

  // Default: Unknown instruction
  return <UnknownInstruction key={index} instruction={instruction} />;
}

export interface InstructionsProps {
  instructions: ParsedInstruction[];
  isLoading?: boolean;
}

export const Instructions: FC<InstructionsProps> = ({
  instructions,
  isLoading,
}) => {
  if (isLoading) {
    return <Skeleton width="100%" height="32px" />;
  }

  return (
    <div className={styles.instructionsContainer}>
      {instructions.flatMap((ix, index) => [
        index > 0 && (
          <div key={`divider-${index}`} className={styles.instructionDivider} />
        ),
        renderInstruction(ix, index),
      ])}
    </div>
  );
};
