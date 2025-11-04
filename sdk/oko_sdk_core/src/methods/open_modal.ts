import type { Result } from "@oko-wallet/stdlib-js";

import type {
  OkoWalletMsgOpenModal,
  OkoWalletInterface,
  OpenModalAckPayload,
} from "@oko-wallet-sdk-core/types";
import type { OpenModalError } from "@oko-wallet-sdk-core/errors";

const FIVE_MINS = 60 * 5 * 1000;

export async function openModal(
  this: OkoWalletInterface,
  msg: OkoWalletMsgOpenModal,
): Promise<Result<OpenModalAckPayload, OpenModalError>> {
  await this.waitUntilInitialized;

  let timeoutId: NodeJS.Timeout | null = null;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Show modal timeout")),
      FIVE_MINS,
    );
  });

  try {
    this.iframe.style.display = "block";

    const openModalAck = await Promise.race([
      this.sendMsgToIframe(msg),
      timeout,
    ]);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

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
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    this.closeModal();
  }
}
