import React from "react";
import type { MakeSolanaSigData } from "@oko-wallet/oko-sdk-core";
import { XCloseIcon } from "@oko-wallet/oko-common-ui/icons/x_close";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Button } from "@oko-wallet/oko-common-ui/button";

import styles from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_signature_modal.module.scss";
import { CommonModal } from "@oko-wallet-attached/components/modal_variants/common/common_modal";
import { useSolSigModal } from "./use_sol_sig_modal";
import { SolSignatureContent } from "./sol_signature_content";
import { SignWithOkoBox } from "@oko-wallet-attached/components/sign_with_oko_box/sign_with_oko_box";

export const MakeSignatureSolModal: React.FC<MakeSignatureSolModalProps> = ({
  getIsAborted,
  data,
  modalId,
}) => {
  const { onReject, onApprove, isLoading, theme, error } = useSolSigModal({
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
          <SolSignatureContent data={data} />
        </div>

        {error && (
          <>
            <Spacing height={12} />
            <div style={{ color: "var(--error)", fontSize: "12px" }}>
              {error}
            </div>
          </>
        )}

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

        <SignWithOkoBox theme={theme} />
      </CommonModal>
    </div>
  );
};

export interface MakeSignatureSolModalProps {
  getIsAborted: () => boolean;
  modalId: string;
  data: MakeSolanaSigData;
}
