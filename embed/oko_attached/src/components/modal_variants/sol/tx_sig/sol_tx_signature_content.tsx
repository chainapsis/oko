import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { SolanaTxSignPayload } from "@oko-wallet/oko-sdk-core";
import type { FC } from "react";

import styles from "../common/signature_content.module.scss";
import { SolanaTxSummary } from "./sol_tx_summary";
import { Avatar } from "@oko-wallet-attached/components/avatar/avatar";
import { SignerAddressOrEmail } from "@oko-wallet-attached/components/modal_variants/common/metadata_content/signer_address_or_email/signer_address_or_email";
import { SOLANA_LOGO_URL } from "@oko-wallet-attached/constants/urls";
import type { ParsedTransaction } from "@oko-wallet-attached/tx-parsers/sol";

interface SolanaTxSignatureContentProps {
  payload: SolanaTxSignPayload;
  parsedTx: ParsedTransaction | null;
  parseError: string | null;
  isLoading: boolean;
}

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

export const SolanaTxSignatureContent: FC<SolanaTxSignatureContentProps> = ({
  payload,
  parsedTx,
  parseError,
  isLoading,
}) => {
  const { origin, signer } = payload;
  const faviconUrl = getFaviconUrl(origin);

  return (
    <div className={styles.signatureContent}>
      <div className={styles.chainInfo}>
        <img src={SOLANA_LOGO_URL} alt="Solana" className={styles.chainLogo} />
        <Spacing width={8} />
        <span className={styles.chainName}>Solana</span>
      </div>

      <Spacing height={16} />

      <div className={styles.signTypeTitle}>Sign Solana Transaction</div>

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

          {/* TODO: refactor this @chemonoworld @Ryz0nd */}
          {/* <SignerAddressOrEmail signer={signer} origin={origin} /> */}
        </div>
      </div>

      <Spacing height={16} />

      <SolanaTxSummary
        payload={payload}
        parsedTx={parsedTx}
        parseError={parseError}
        isLoading={isLoading}
      />
    </div>
  );
};
