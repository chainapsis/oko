import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { SvmTxSignPayload } from "@oko-wallet/oko-sdk-core";
import type { FC } from "react";

import styles from "../common/signature_content.module.scss";
import { SvmTxSummary } from "./svm_tx_summary";
import { Avatar } from "@oko-wallet-attached/components/avatar/avatar";
import { SignerAddressOrEmail } from "@oko-wallet-attached/components/modal_variants/common/metadata_content/signer_address_or_email/signer_address_or_email";
import { SOLANA_LOGO_URL } from "@oko-wallet-attached/constants/urls";
import type { ParsedTransaction } from "@oko-wallet-attached/tx-parsers/svm";
import { getFaviconUrl } from "@oko-wallet-attached/utils/favicon";

interface SvmTxSignatureContentProps {
  payload: SvmTxSignPayload;
  parsedTx: ParsedTransaction | null;
  parseError: string | null;
  isLoading: boolean;
}

export const SvmTxSignatureContent: FC<SvmTxSignatureContentProps> = ({
  payload,
  parsedTx,
  parseError,
  isLoading,
}) => {
  const { origin, signer } = payload;
  const faviconUrl = getFaviconUrl(origin);

  return (
    <div className={styles.signatureContent}>
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

          <SignerAddressOrEmail
            signer={signer}
            origin={origin}
            initialViewType="Login Info"
          />
        </div>
      </div>

      <Spacing height={28} />

      <SvmTxSummary
        payload={payload}
        parsedTx={parsedTx}
        parseError={parseError}
        isLoading={isLoading}
      />
    </div>
  );
};
