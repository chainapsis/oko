import type { Result } from "@oko-wallet/stdlib-js";

import type {
  OkoWalletInterface,
  OkoWalletMsg,
  OkoWalletMsgOpenModal,
  OpenModalAckPayload,
} from "@oko-wallet-sdk-core/types";
import type { OpenModalError } from "@oko-wallet-sdk-core/errors";

const FIVE_MINS = 60 * 5 * 1000;
const POPUP_READY_TIMEOUT = 30 * 1000;

interface PopupContext {
  id: string;
  popupWindow: Window;
  waitUntilReady: Promise<void>;
}

export async function openModal(
  this: OkoWalletInterface,
  msg: OkoWalletMsgOpenModal,
): Promise<Result<OpenModalAckPayload, OpenModalError>> {
  const needsPopup = msg.payload.modal_type === "auth/email_login";
  let popupContext: PopupContext | null = null;

  if (needsPopup) {
    popupContext = openEmailLoginPopup.call(this);
    this.activePopupId = popupContext.id;
    this.activePopupWindow = popupContext.popupWindow;
  }

  await this.waitUntilInitialized;

  if (!needsPopup) {
    this.iframe.style.display = "block";
  }

  const { timeoutPromise, cancelTimeout } = createTimeout(FIVE_MINS);

  try {
    if (needsPopup && popupContext) {
      await popupContext.waitUntilReady;
    }

    const openModalAck = await Promise.race([
      needsPopup && popupContext
        ? sendMsgToPopupWindow(
            popupContext.popupWindow,
            msg,
            this.sdkEndpoint,
            popupContext.id,
          )
        : this.sendMsgToIframe(msg),
      timeoutPromise,
    ]);

    cancelTimeout();

    if (openModalAck.msg_type !== "open_modal_ack") {
      return {
        success: false,
        err: { type: "invalid_ack_type", received: openModalAck.msg_type },
      };
    }

    return { success: true, data: openModalAck.payload };
  } catch (error) {
    return { success: false, err: { type: "unknown_error", error } };
  } finally {
    cancelTimeout();
    this.closeModal();
  }
}

function openEmailLoginPopup(this: OkoWalletInterface): PopupContext {
  const popupId = `oko_popup_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const url = new URL("/login", this.sdkEndpoint);
  url.searchParams.set("popup_id", popupId);
  url.searchParams.set("host_origin", window.location.origin);

  const width = 480;
  const height = 640;
  const left = Math.max((window.screen.width - width) / 2, 0);
  const top = Math.max((window.screen.height - height) / 2, 0);

  const popupWindow = window.open(
    url.toString(),
    popupId,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
  );

  if (!popupWindow) {
    throw new Error("Failed to open popup window");
  }

  const popupOrigin = new URL(this.sdkEndpoint).origin;

  return {
    id: popupId,
    popupWindow,
    waitUntilReady: waitForPopupReady(popupId, popupWindow, popupOrigin),
  };
}

function waitForPopupReady(
  popupId: string,
  popupWindow: Window,
  popupOrigin: string,
) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Popup did not initialize in time"));
    }, POPUP_READY_TIMEOUT);

    const closeWatcher = window.setInterval(() => {
      if (popupWindow.closed) {
        cleanup();
        reject(new Error("Popup closed before it was ready"));
      }
    }, 500);

    function cleanup() {
      window.clearTimeout(timeoutId);
      window.clearInterval(closeWatcher);
      window.removeEventListener("message", onMessage);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== popupOrigin) {
        return;
      }

      const data = event.data as {
        target?: string;
        msg_type?: string;
        payload?: { popup_id?: string };
      };

      if (
        data?.target === "oko_attached_popup" &&
        data.msg_type === "popup_ready" &&
        data.payload?.popup_id === popupId
      ) {
        cleanup();
        resolve();
      }
    }

    window.addEventListener("message", onMessage);
  });
}

function sendMsgToPopupWindow(
  popupWindow: Window,
  msg: OkoWalletMsgOpenModal,
  sdkEndpoint: string,
  popupId: string,
) {
  const targetOrigin = new URL(sdkEndpoint).origin;

  return new Promise<OkoWalletMsg>((resolve, reject) => {
    if (!popupWindow || popupWindow.closed) {
      reject(new Error("Popup window is closed"));
      return;
    }

    const channel = new MessageChannel();
    let resolved = false;

    const closeWatcher = window.setInterval(() => {
      if (popupWindow.closed && !resolved) {
        cleanup();
        reject(new Error("Popup closed before responding"));
      }
    }, 500);

    function cleanup() {
      channel.port1.close();
      window.clearInterval(closeWatcher);
      window.removeEventListener("message", onPostMessage);
    }

    // Handle response via MessageChannel port
    channel.port1.onmessage = (event: MessageEvent) => {
      const data = event.data as OkoWalletMsg;
      resolved = true;
      cleanup();
      resolve(data);
    };

    // Also handle response via regular postMessage (fallback for Auth0 callback)
    function onPostMessage(event: MessageEvent) {
      if (event.origin !== targetOrigin) {
        return;
      }

      const data = event.data as OkoWalletMsg;
      if (
        data.target === "oko_sdk" &&
        data.msg_type === "open_modal_ack" &&
        data.payload?.modal_type === "auth/email_login" &&
        "popup_id" in data.payload &&
        (data.payload.popup_id ===
          ("popup_id" in msg.payload ? msg.payload.popup_id : popupId) ||
          data.payload.popup_id === popupId)
      ) {
        resolved = true;
        cleanup();
        resolve(data);
      }
    }

    window.addEventListener("message", onPostMessage);

    try {
      popupWindow.postMessage(msg, targetOrigin, [channel.port2]);
    } catch (error) {
      cleanup();
      reject(
        error instanceof Error
          ? error
          : new Error("Failed to send message to popup"),
      );
    }
  });
}

function createTimeout(duration: number) {
  let timeoutId: NodeJS.Timeout | null = null;

  return {
    timeoutPromise: new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Show modal timeout"));
      }, duration);
    }),
    cancelTimeout: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}
