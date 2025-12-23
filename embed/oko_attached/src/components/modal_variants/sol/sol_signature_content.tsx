import React from "react";
import type { MakeSolanaSigData } from "@oko-wallet/oko-sdk-core";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./sol_signature_content.module.scss";
import { Avatar } from "@oko-wallet-attached/components/avatar/avatar";
import { SignerAddressOrEmail } from "@oko-wallet-attached/components/modal_variants/common/metadata_content/signer_address_or_email/signer_address_or_email";
import { SolanaTxSummary } from "./sol_tx_summary";

interface SolanaSignatureContentProps {
  data: MakeSolanaSigData;
}

const SOLANA_LOGO_URL =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

function getFaviconUrl(origin: string): string {
  if (!origin) return "";
  try {
    const parsed = new URL(origin);
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
      parsed.origin,
    )}`;
  } catch {
    return "";
  }
}

export const SolanaSignatureContent: React.FC<SolanaSignatureContentProps> = ({
  data,
}) => {
  const signType = data.sign_type;
  const origin = data.payload.origin;
  const signer = data.payload.signer;

  const getTitle = () => {
    switch (signType) {
      case "tx":
        return "Sign Solana Transaction";
      case "message":
        return "Sign Message";
      case "all_tx":
        return "Sign Multiple Transactions";
      default:
        return "Sign Request";
    }
  };

  const faviconUrl = getFaviconUrl(origin);

  return (
    <div className={styles.signatureContent}>
      <div className={styles.chainInfo}>
        <img src={SOLANA_LOGO_URL} alt="Solana" className={styles.chainLogo} />
        <Spacing width={8} />
        <span className={styles.chainName}>Solana</span>
      </div>

      <Spacing height={16} />

      <div className={styles.signTypeTitle}>{getTitle()}</div>

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
                Solana signature
              </Typography>
            </div>
          </div>

          <SignerAddressOrEmail signer={signer} origin={origin} />
        </div>
      </div>

      <Spacing height={16} />

      <SolanaTxSummary data={data} />
    </div>
  );
};
