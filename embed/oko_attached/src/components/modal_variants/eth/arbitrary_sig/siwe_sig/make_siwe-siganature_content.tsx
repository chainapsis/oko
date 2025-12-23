import React from "react";
import type { EthereumArbitrarySignPayload } from "@oko-wallet/oko-sdk-core";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { Theme } from "@oko-wallet/oko-common-ui/theme";

import styles from "./ethereum_siwe_signature_content.module.scss";
import {
  getSiweMessage,
  verifySiweMessage,
} from "@oko-wallet-attached/components/modal_variants/eth/siwe_message";
import { SiweSigTitleBadge } from "@oko-wallet-attached/components/modal_variants/eth/arbitrary_sig/siwe_sig/siwe_sig_title_badge";
import { SignerAddressOrEmailForSiwe } from "@oko-wallet-attached/components/modal_variants/eth/arbitrary_sig/siwe_sig/signer_address_or_email_for_siwe";
import { MakeSignatureRawCodeBlockContainer } from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_sig_modal_code_block_container";
import { MakeSignatureRawCodeBlock } from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_sig_modal_code_block";
import { SiweRiskWarningBox } from "@oko-wallet-attached/components/modal_variants/eth/arbitrary_sig/siwe_sig/siwe-risk-warning-box";
import { getFaviconUrl } from "@oko-wallet-attached/utils/favicon";
import { Avatar } from "@oko-wallet-attached/components/avatar/avatar";

interface EthereumSiweSignatureContentProps {
  payload: EthereumArbitrarySignPayload;
  theme: Theme | null;
}

export const EthereumSiweSignatureContent: React.FC<
  EthereumSiweSignatureContentProps
> = ({ payload, theme }) => {
  const message = getSiweMessage(payload.data.message);
  const faviconUrl = getFaviconUrl(payload.origin);

  if (!message) {
    // @unreachable
    throw new Error("unreachable");
  }

  const isValidSiweMessage = verifySiweMessage(message, payload.origin);

  return (
    <div>
      {isValidSiweMessage ? (
        <SiweSigTitleBadge theme={theme} />
      ) : (
        <SiweRiskWarningBox />
      )}

      <div className={styles.metadataContainer}>
        <Spacing height={isValidSiweMessage ? 8 : 12} />
        <Typography size="lg" color="primary" weight="semibold">
          Sign in to
        </Typography>

        <Spacing height={4} />
        <div className={styles.originRow}>
          {faviconUrl && faviconUrl.length > 0 && (
            <img
              src={faviconUrl}
              alt="favicon"
              className={styles.originFavicon}
            />
          )}
          <Typography
            size="lg"
            color={isValidSiweMessage ? "primary" : "warning-primary"}
            weight="semibold"
          >
            {payload.origin.replace(/^https?:\/\//, "")}
          </Typography>
        </div>

        <Spacing height={8} />
        <SignerAddressOrEmailForSiwe
          origin={payload.origin}
          signer={payload.signer}
          initialViewType="Login Info"
        />
      </div>

      <Spacing height={20} />

      <div className={styles.chainInfoContainer}>
        <div className={styles.chainInfoRow}>
          <Typography size="xs" color="secondary" weight="semibold">
            Estimated in balance
          </Typography>
          <Typography size="sm" color="secondary" weight="medium">
            No changes
          </Typography>
        </div>

        <Spacing height={8} />
        <div className={styles.chainInfoRow}>
          <Typography size="xs" color="secondary" weight="semibold">
            Network
          </Typography>

          <div className={styles.chainInfoRowContent}>
            <Avatar
              src={payload.chain_info.chain_symbol_image_url}
              alt="chain icon"
              size="sm"
              variant="rounded"
            />
            <Typography size="sm" color="secondary" weight="medium">
              {payload.chain_info.chain_name}
            </Typography>
          </div>
        </div>
      </div>

      <Spacing height={16} />
      <MakeSignatureRawCodeBlockContainer className={styles.messageContainer}>
        <Typography color="tertiary" size="xs" weight="semibold">
          Message
        </Typography>

        <Spacing height={16} />
        <MakeSignatureRawCodeBlock
          code={message.statement ?? ""}
          className={styles.messageContent}
        />
      </MakeSignatureRawCodeBlockContainer>
    </div>
  );
};
