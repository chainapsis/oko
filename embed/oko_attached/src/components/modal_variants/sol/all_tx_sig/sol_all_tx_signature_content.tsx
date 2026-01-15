import type { FC } from "react";
import type { SolanaAllTxSignPayload } from "@oko-wallet/oko-sdk-core";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "../common/signature_content.module.scss";
import { Avatar } from "@oko-wallet-attached/components/avatar/avatar";
import { SOLANA_LOGO_URL } from "@oko-wallet-attached/constants/urls";

interface SolanaAllTxSignatureContentProps {
  payload: SolanaAllTxSignPayload;
}

function getFaviconUrl(origin: string): string {
  if (!origin) {
    return "";
  }
  try {
    const parsed = new URL(origin);
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
      parsed.origin,
    )}`;
  } catch {
    return "";
  }
}

export const SolanaAllTxSignatureContent: FC<
  SolanaAllTxSignatureContentProps
> = ({ payload }) => {
  const { origin, signer, data } = payload;
  const faviconUrl = getFaviconUrl(origin);
  const txCount = data.serialized_transactions.length;

  return (
    <div className={styles.signatureContent}>
      <div className={styles.chainInfo}>
        <img src={SOLANA_LOGO_URL} alt="Solana" className={styles.chainLogo} />
        <Spacing width={8} />
        <span className={styles.chainName}>Solana</span>
      </div>

      <Spacing height={16} />

      <div className={styles.signTypeTitle}>
        Sign {txCount} Solana Transactions
      </div>

      <Spacing height={12} />

      <div className={styles.metadataWrapper}>
        <div className={styles.originRow}>
          {faviconUrl && faviconUrl.length > 0 && (
            <img
              src={faviconUrl}
              alt="favicon"
              className={styles.originFavicon}
            />
          )}
          <Typography size="lg" color="primary" weight="semibold">
            {origin.replace(/^https?:\/\//, "")}
          </Typography>
        </div>

        <Spacing height={4} />

        <div className={styles.signInfoColumn}>
          <div className={styles.chainInfoRow}>
            <Typography size="lg" color="secondary" weight="semibold">
              requested your
            </Typography>
            <div className={styles.chainNameGroup}>
              <Avatar
                src={SOLANA_LOGO_URL}
                alt="Solana"
                size="sm"
                variant="rounded"
              />
              <Typography size="lg" color="secondary" weight="semibold">
                Solana signatures
              </Typography>
            </div>
          </div>

          {/* TODO: refactor this @chemonoworld @Ryz0nd */}
          {/* <SignerAddressOrEmail signer={signer} origin={origin} /> */}
        </div>
      </div>

      <Spacing height={16} />

      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "12px",
        }}
      >
        <Typography size="md" color="secondary">
          This request will sign {txCount} transactions at once. Please review
          carefully before approving.
        </Typography>
      </div>
    </div>
  );
};
