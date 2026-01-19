import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { FC } from "react";

import styles from "./sol_tx_fee.module.scss";
import { useCalculateFee } from "@oko-wallet-attached/web3/solana/use_calculate_fee";

const LAMPORTS_PER_SOL = 1_000_000_000;

function formatFee(lamports: number): string {
  const sol = lamports / LAMPORTS_PER_SOL;
  if (sol < 0.000001) {
    return `${lamports} lamports`;
  }
  return `${sol.toFixed(6)} SOL`;
}

export interface SolanaTxFeeProps {
  serializedTransaction: string;
  isVersioned: boolean;
}

export const SolanaTxFee: FC<SolanaTxFeeProps> = ({
  serializedTransaction,
  isVersioned,
}) => {
  const { fee } = useCalculateFee({
    serializedTransaction,
    isVersioned,
  });

  return (
    <div className={styles.feeContainer}>
      <Typography color="tertiary" size="xs" weight="medium">
        Fee
      </Typography>
      <Typography color="tertiary" size="xs" weight="medium">
        {fee !== null ? formatFee(fee) : "-"}
      </Typography>
    </div>
  );
};
