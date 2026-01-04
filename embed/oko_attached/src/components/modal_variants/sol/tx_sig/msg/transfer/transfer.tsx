import type { FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import { Avatar } from "@oko-wallet-attached/components/avatar/avatar";
import styles from "../instructions.module.scss";
import { TxRow } from "@oko-wallet-attached/components/modal_variants/common/tx_row";

const SOLANA_LOGO_URL =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatLamports(lamports: bigint | number): string {
  // Use scientific notation to avoid floating-point precision issues
  // SOL has 9 decimals
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 9,
  });
  return `${formatter.format(`${lamports}E-9` as unknown as number)} SOL`;
}

export interface SolTransferPrettyProps {
  lamports: bigint | number;
  from?: string;
  to?: string;
}

export const SolTransferPretty: FC<SolTransferPrettyProps> = ({
  lamports,
  from,
  to,
}) => {
  return (
    <div className={styles.container}>
      <TxRow label="Send">
        <div className={styles.tokenInfo}>
          <Avatar
            src={SOLANA_LOGO_URL}
            alt="SOL"
            size="sm"
            variant="rounded"
          />
          <Typography
            color="secondary"
            size="lg"
            weight="semibold"
            className={styles.tokenAmount}
          >
            {formatLamports(lamports)}
          </Typography>
        </div>
      </TxRow>
      {from && (
        <TxRow label="From">
          <Typography
            color="secondary"
            size="sm"
            weight="medium"
            className={styles.address}
          >
            {shortenAddress(from)}
          </Typography>
        </TxRow>
      )}
      {to && (
        <TxRow label="To">
          <Typography
            color="secondary"
            size="sm"
            weight="medium"
            className={styles.address}
          >
            {shortenAddress(to)}
          </Typography>
        </TxRow>
      )}
    </div>
  );
};
