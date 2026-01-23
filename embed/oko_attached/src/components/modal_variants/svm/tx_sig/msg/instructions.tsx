import type { FC, ReactNode } from "react";

import { TokenTransferPretty } from "./transfer/token_transfer";
import { SvmTransferPretty } from "./transfer/transfer";
import { UnknownInstruction } from "./unknown/unknown";
import { CollapsibleList } from "@oko-wallet-attached/components/modal_variants/common/transaction_summary";
import type { ParsedInstruction } from "@oko-wallet-attached/tx-parsers/svm";

function getInstructionKey(
  instruction: ParsedInstruction,
  index: number,
): string {
  return `${instruction.programId}-${instruction.instructionName}-${index}`;
}

function getInstructionTitle(instruction: ParsedInstruction): string {
  const { instructionName } = instruction;

  // Capitalize instruction name (e.g., "transfer" -> "Transfer")
  return instructionName.charAt(0).toUpperCase() + instructionName.slice(1);
}

function renderInstructionContent(instruction: ParsedInstruction): ReactNode {
  const { programId, instructionName, data, accounts } = instruction;

  // System Program - SOL Transfer
  if (programId === "11111111111111111111111111111111") {
    if (instructionName === "transfer") {
      const lamports = data.lamports as bigint | number | undefined;
      const to = accounts[1]?.pubkey;

      if (lamports !== undefined) {
        return <SvmTransferPretty lamports={lamports} to={to} />;
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
        return <TokenTransferPretty amount={amount} to={to} />;
      }
    }

    return <UnknownInstruction instruction={instruction} />;
  }

  // Default: Unknown instruction
  return <UnknownInstruction instruction={instruction} />;
}

export interface InstructionsProps {
  instructions: ParsedInstruction[];
  isLoading?: boolean;
}

export const Instructions: FC<InstructionsProps> = ({
  instructions,
  isLoading,
}) => {
  return (
    <CollapsibleList
      items={instructions}
      getKey={getInstructionKey}
      getTitle={getInstructionTitle}
      renderContent={renderInstructionContent}
      isLoading={isLoading}
    />
  );
};
