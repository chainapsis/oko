import type { OkoWalletMsgSignOutAck } from "@oko-wallet/oko-sdk-core";

import { errorToLog } from "@oko-wallet-attached/logging/error";
import { postLog } from "@oko-wallet-attached/requests/logging";
import { useAppState } from "@oko-wallet-attached/store/app";
import type { MsgEventContext } from "@oko-wallet-attached/window_msgs/types";
import { OKO_SDK_TARGET } from "@oko-wallet-attached/window_msgs/target";
export async function handleSignOut(ctx: MsgEventContext): Promise<void> {
  const { port, hostOrigin } = ctx;

  try {
    useAppState.getState().resetAll(hostOrigin);
    console.log("[attached] signed out");

    const ack: OkoWalletMsgSignOutAck = {
      target: OKO_SDK_TARGET,
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

    const ack: OkoWalletMsgSignOutAck = {
      target: OKO_SDK_TARGET,
      msg_type: "sign_out_ack",
      payload: {
        success: false,
        err: errorMessage,
      },
    };

    port.postMessage(ack);
  }
}
