import { type FC } from "react";
import type { MakeEIP712SigData } from "@oko-wallet/oko-sdk-core";
import { XCloseIcon } from "@oko-wallet/oko-common-ui/icons/x_close";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Button } from "@oko-wallet/oko-common-ui/button";

import styles from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_signature_modal.module.scss";
import { CommonModal } from "@oko-wallet-attached/components/modal_variants/common/common_modal";
import { DemoView } from "@oko-wallet-attached/components/modal_variants/common/make_signature/demo_view";
import { ArbitrarySignatureDesc } from "@oko-wallet-attached/components/modal_variants/common/arbitrary_sig_desc/arbitrary_signature_desc";
import { useEIP712SigModal } from "./hooks/use_eip712_sig_modal";
import { useEIP712Action } from "./hooks/use_eip712_action";
import { EthereumEip712SignatureContent } from "./ethereum_eip712_signature_content";
import { SignWithOkoBox } from "@oko-wallet-attached/components/sign_with_oko_box/sign_with_oko_box";
import { X402PaymentDesc } from "./x402_payment_desc";

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

  const actionResult = useEIP712Action(data.payload);
  const isEIP3009Payment =
    actionResult.action?.kind === "eip3009.transferWithAuthorization";

  return (
    <div className={styles.container}>
      <CommonModal className={styles.modal}>
        <div className={styles.closeButton} onClick={onReject}>
          <XCloseIcon size={20} color="var(--fg-quaternary)" />
        </div>

        <div className={styles.modalInnerContentContainer}>
          <EthereumEip712SignatureContent
            payload={data.payload}
            actionResult={actionResult}
          />
        </div>

        <Spacing height={20} />
        {isEIP3009Payment ? <X402PaymentDesc /> : <ArbitrarySignatureDesc />}

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

        <SignWithOkoBox theme={theme} />
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
