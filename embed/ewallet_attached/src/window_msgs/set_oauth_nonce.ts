import type {
  EWalletMsgSetOAuthNonce,
  EWalletMsgSetOAuthNonceAck,
} from "@oko-wallet/oko-sdk-core";

import { EWALLET_SDK_TARGET } from "./target";
import { useAppState } from "@oko-wallet-attached/store/app";
import type { MsgEventContext } from "./types";

export function handleSetOAuthNonce(
  ctx: MsgEventContext,
  message: EWalletMsgSetOAuthNonce,
) {
  const { port, hostOrigin } = ctx;

  if (!message.payload) {
    throw new Error("Nonce is empty");
  }

  const appState = useAppState.getState();
  appState.setNonce(hostOrigin, message.payload);

  const ack: EWalletMsgSetOAuthNonceAck = {
    target: EWALLET_SDK_TARGET,
    msg_type: "set_oauth_nonce_ack",
    payload: {
      success: true,
      data: null,
    },
  };

  port.postMessage(ack);
}
