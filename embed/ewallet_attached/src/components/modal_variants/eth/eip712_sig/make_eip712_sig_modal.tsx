import { type FC } from "react";
import type { MakeEIP712SigData } from "@oko-wallet/oko-sdk-core";
import { XCloseIcon } from "@oko-wallet/ewallet-common-ui/icons/x_close";
import { Spacing } from "@oko-wallet/ewallet-common-ui/spacing";
import { Button } from "@oko-wallet/ewallet-common-ui/button";
import { Typography } from "@oko-wallet/ewallet-common-ui/typography";
import { OkoProductLogoIcon } from "@oko-wallet/ewallet-common-ui/icons/oko_product_logo_icon";

import styles from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_signature_modal.module.scss";
import { CommonModal } from "@oko-wallet-attached/components/modal_variants/common/common_modal";
import { DemoView } from "@oko-wallet-attached/components/modal_variants/common/make_signature/demo_view";
import { ArbitrarySignatureDesc } from "@oko-wallet-attached/components/modal_variants/common/arbitrary_sig_desc/arbitrary_signature_desc";
import { useEIP712SigModal } from "./hooks/use_eip712_sig_modal";
import { EthereumEip712SignatureContent } from "./ethereum_eip712_signature_content";

export const MakeEIP712SigModal: FC<MakeEIP712SigModalProps> = ({
  getIsAborted,
  data,
  modalId,
}) => {
  const { onReject, onApprove, isApproveEnabled, isLoading, isDemo, theme } =
    useEIP712SigModal({
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
          <EthereumEip712SignatureContent payload={data.payload} />
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

export interface MakeEIP712SigModalProps {
  getIsAborted: () => boolean;
  modalId: string;
  data: MakeEIP712SigData;
}
