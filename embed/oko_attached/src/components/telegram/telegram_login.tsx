import { useEffect, useMemo, type FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import { AttachedInitialized } from "@oko-wallet-attached/components/attached_initialized/attached_initialized";
import { useMemoryState } from "@oko-wallet-attached/store/memory";
import { TelegramLoginPopup } from "@oko-wallet-attached/components/telegram/telegram_login_popup";
import { PopupErrorView } from "@oko-wallet-attached/components/login_popup/popup_error_view";
import styles from "./telegram_login.module.scss";

export const TelegramLogin: FC = () => {
  useNotifyPopupReady();

  const isInlineLayout = useInlinePopupLayout();
  const modalRequest = useMemoryState((state) => state.modalRequest);
  const error = useMemoryState((state) => state.error);
  const telegramModalPayload =
    modalRequest?.msg.payload.modal_type === "auth/telegram_login"
      ? modalRequest.msg.payload
      : null;

  return (
    <AttachedInitialized>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          {isInlineLayout ? (
            error ? (
              <PopupErrorView error={error} />
            ) : telegramModalPayload ? (
              <TelegramLoginPopup />
            ) : (
              <LoadingCard />
            )
          ) : (
            <InlineOnlyNotice />
          )}
        </div>
      </div>
    </AttachedInitialized>
  );
};

const LoadingCard: FC = () => <div className={styles.blankPanel} />;

const InlineOnlyNotice: FC = () => (
  <div className={styles.panel}>
    <div className={styles.loadingState}>
      <Typography size="md" color="secondary">
        Please launch the Oko login popup from the host application.
      </Typography>
    </div>
  </div>
);

function useNotifyPopupReady() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modalId = params.get("modal_id");
    const hostOrigin = params.get("host_origin");

    if (!modalId || !hostOrigin || !window.opener) {
      return;
    }

    window.opener.postMessage(
      {
        target: "oko_attached_popup",
        msg_type: "popup_ready",
        payload: { modal_id: modalId },
      },
      hostOrigin,
    );
  }, []);
}

function useInlinePopupLayout() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const layout = searchParams.get("popup_layout");

    if (layout) {
      return layout === "inline";
    }

    return !!window.opener;
  }, []);
}
