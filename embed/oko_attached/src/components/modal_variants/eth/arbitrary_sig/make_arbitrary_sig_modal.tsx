import React from "react";
import type { MakeArbitrarySigData } from "@oko-wallet/oko-sdk-core";
import { XCloseIcon } from "@oko-wallet/oko-common-ui/icons/x_close";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { OkoLogoIcon } from "@oko-wallet-common-ui/icons/oko_logo_icon";

import styles from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_signature_modal.module.scss";
import { CommonModal } from "@oko-wallet-attached/components/modal_variants/common/common_modal";
import { DemoView } from "@oko-wallet-attached/components/modal_variants/common/make_signature/demo_view";
import { useArbitrarySigModal } from "./hooks/use_arbitrary_sig_modal";
import { ArbitrarySignatureDesc } from "@oko-wallet-attached/components/modal_variants/common/arbitrary_sig_desc/arbitrary_signature_desc";
import { EthereumArbitrarySignatureContent } from "./ethereum_arbitrary_signature_content";

export const MakeArbitrarySigModal: React.FC<MakeArbitrarySigModalProps> = ({
  getIsAborted,
  data,
  modalId,
}) => {
  const { onReject, onApprove, isApproveEnabled, isLoading, isDemo, theme } =
    useArbitrarySigModal({
      getIsAborted,
      data,
      modalId,
    });

  return (
    <div className={styles.container}>
      <CommonModal className={styles.modal}>
        <div className={styles.closeButton} onClick={onReject}>
          <XCloseIcon size={20} color="var(--fg-quaternary)" />
        </div>

        <div className={styles.modalInnerContentContainer}>
          <EthereumArbitrarySignatureContent payload={data.payload} />
        </div>

        <Spacing height={20} />
        <ArbitrarySignatureDesc />

        <Spacing height={20} />

        <div className={styles.buttonContainer}>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onReject}
            className={styles.rejectButton}
          >
            Reject
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onApprove}
            isLoading={isLoading}
            disabled={!isApproveEnabled}
          >
            {isLoading ? "Signing..." : "Approve"}
          </Button>
        </div>
        <Spacing height={12} />

        {/* TODO: separate a standalone component for this */}
        <div className={styles.signWithKeplrBox}>
          <Typography size="xs" color="quaternary" weight="medium">
            Sign with
          </Typography>
          <OkoLogoIcon width={47} height={18} theme={theme} />
        </div>
      </CommonModal>

      {isDemo && <DemoView />}
    </div>
  );
};

export interface MakeArbitrarySigModalProps {
  getIsAborted: () => boolean;
  modalId: string;
  data: MakeArbitrarySigData;
}
