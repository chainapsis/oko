import type { FC } from "react";
import type { OpenModalAckPayload } from "@oko-wallet/oko-sdk-core";
import {
  useFloating,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  useId,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
} from "@floating-ui/react";

import styles from "./modal.module.scss";
import { useMemoryState } from "@oko-wallet-attached/store/memory";
import { ModalDialog } from "./modal_dialog";

export const Modal: FC = () => {
  const modalRequest = useMemoryState((st) => st.modalRequest);
  const isOpen = !!modalRequest;

  const { closeModal, clearError } = useMemoryState();

  function onOpenChange(open: boolean) {
    console.log("onOpenChange(): %s", open);

    if (modalRequest) {
      // TODO: hyunjae
      const { modal_type, modal_id } = modalRequest.msg.payload;
      const { error } = useMemoryState.getState();

      if (error) {
        closeModal(error);
        clearError();
        return;
      } else {
        let payload: OpenModalAckPayload = {
          modal_type,
          modal_id,
          type: "reject",
        };

        closeModal(payload);
      }
    }
  }

  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange,
  });

  const click = useClick(context);
  const role = useRole(context);
  const dismiss = useDismiss(context, {
    outsidePressEvent: "mousedown",
    outsidePress: (event) => event.button !== 2,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    role,
    dismiss,
  ]);

  const headingId = useId();
  const descriptionId = useId();

  return (
    <>
      <button
        ref={refs.setReference}
        className={styles.invisible}
        {...getReferenceProps()}
      />
      <FloatingPortal>
        {isOpen && (
          <FloatingOverlay className={styles.overlay} lockScroll>
            <FloatingFocusManager context={context} initialFocus={-1}>
              <div
                className={styles.floatingWrapper}
                ref={refs.setFloating}
                aria-labelledby={headingId}
                aria-describedby={descriptionId}
                {...getFloatingProps()}
              >
                <ModalDialog modalRequest={modalRequest} />
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </FloatingPortal>
    </>
  );
};
