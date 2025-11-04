import { useAppState } from "@oko-wallet-attached/store/app";
import { EWALLET_SDK_TARGET } from "./target";
import type { EWalletMsgSignOutAck } from "@oko-wallet/oko-sdk-core";

import type { MsgEventContext } from "./types";
import { postLog } from "@oko-wallet-attached/requests/logging";
import { errorToLog } from "@oko-wallet-attached/logging/error";

export async function handleSignOut(ctx: MsgEventContext): Promise<void> {
  const { port, hostOrigin } = ctx;

  try {
    useAppState.getState().resetAll(hostOrigin);
    console.log("[attached] signed out");

    const ack: EWalletMsgSignOutAck = {
      target: EWALLET_SDK_TARGET,
      msg_type: "sign_out_ack",
      payload: {
        success: true,
        data: null,
      },
    };

    port.postMessage(ack);
  } catch (error: any) {
    postLog(
      {
        level: "error",
        message: "[attached] signout error",
        error: errorToLog(error),
      },
      { console: true },
    );

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    const ack: EWalletMsgSignOutAck = {
      target: EWALLET_SDK_TARGET,
      msg_type: "sign_out_ack",
      payload: {
        success: false,
        err: errorMessage,
      },
    };

    port.postMessage(ack);
  }
}
