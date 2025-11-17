import { useEffect, type FC } from "react";

import { Modal } from "@oko-wallet-attached/components/modal/modal";
import { AttachedInitialized } from "@oko-wallet-attached/components/attached_initialized/attached_initialized";
import styles from "./login.module.scss";

export const Login: FC = () => {
  useNotifyPopupReady();

  return (
    <AttachedInitialized>
      <div className={styles.wrapper}>
        <Modal />
      </div>
    </AttachedInitialized>
  );
};

function useNotifyPopupReady() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const popupId = params.get("popup_id");
    const hostOrigin = params.get("host_origin");

    if (!popupId || !hostOrigin || !window.opener) {
      return;
    }

    window.opener.postMessage(
      {
        target: "oko_attached_popup",
        msg_type: "popup_ready",
        payload: { popup_id: popupId },
      },
      hostOrigin,
    );
  }, []);
}
