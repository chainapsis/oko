import React from "react";
import type { CosmosArbitrarySigData } from "@oko-wallet/oko-sdk-core";
import { XCloseIcon } from "@oko-wallet/ewallet-common-ui/icons/x_close";
import { Spacing } from "@oko-wallet/ewallet-common-ui/spacing";
import { Button } from "@oko-wallet/ewallet-common-ui/button";
import { Typography } from "@oko-wallet/ewallet-common-ui/typography";
import { OkoProductLogoIcon } from "@oko-wallet/ewallet-common-ui/icons/oko_product_logo_icon";

import styles from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_signature_modal.module.scss";
import { CommonModal } from "@oko-wallet-attached/components/modal_variants/common/common_modal";
import { DemoView } from "@oko-wallet-attached/components/modal_variants/common/make_signature/demo_view";
import { useArbitrarySigModal } from "./use_arbitrary_sig_modal";
import { ArbitrarySignatureDesc } from "@oko-wallet-attached/components/modal_variants/common/arbitrary_sig_desc/arbitrary_signature_desc";
import { CosmosArbitrarySignatureContent } from "./cosmos_arbitrary_signature_content";

export const MakeArbitrarySigModal: React.FC<MakeArbitrarySigModalProps> = ({
  getIsAborted,
  data,
  modalId,
}) => {
  const { onReject, onApprove, isLoading, isDemo, theme } =
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
          <CosmosArbitrarySignatureContent payload={data.payload} />
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
          >
            {isLoading ? "Signing..." : "Approve"}
          </Button>
        </div>
        <Spacing height={12} />

        <div className={styles.signWithKeplrBox}>
          <Typography size="xs" color="quaternary" weight="medium">
            Sign with
          </Typography>
          <OkoProductLogoIcon width={43} height={20} theme={theme} />
        </div>
      </CommonModal>

      {isDemo && <DemoView />}
    </div>
  );
};

export interface MakeArbitrarySigModalProps {
  getIsAborted: () => boolean;
  modalId: string;
  data: CosmosArbitrarySigData;
}
