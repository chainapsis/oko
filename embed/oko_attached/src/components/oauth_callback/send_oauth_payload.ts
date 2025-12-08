import type { Result } from "@oko-wallet/stdlib-js";
import type {
  OkoWalletMsg,
  OkoWalletMsgOAuthInfoPass,
  OAuthPayload,
  OAuthTokenRequestPayload,
} from "@oko-wallet/oko-sdk-core";

import { sendMsgToWindow } from "@oko-wallet-attached/window_msgs/send";
import type {
  HandleCallbackError,
  SendMsgToEmbeddedWindowError,
} from "@oko-wallet-attached/components/google_callback/types";

export async function sendOAuthPayloadToEmbeddedWindow(
  payload: OAuthPayload | OAuthTokenRequestPayload,
): Promise<Result<void, HandleCallbackError>> {
  if (!window.opener) {
    return {
      success: false,
      err: {
        type: "opener_window_not_exists",
      },
    };
  }

  const msg: OkoWalletMsgOAuthInfoPass = {
    target: "oko_attached",
    msg_type: "oauth_info_pass",
    payload,
  };

  const sendRes = await sendMsgToEmbeddedWindow(msg);

  if (!sendRes.success) {
    return {
      success: false,
      err: {
        type: "msg_pass_fail",
        error: sendRes.err.type,
      },
    };
  }

  const ack = sendRes.data;

  if (ack.msg_type !== "oauth_info_pass_ack") {
    return {
      success: false,
      err: { type: "wrong_ack_type", msg_type: ack.msg_type },
    };
  }

  return { success: true, data: void 0 };
}

async function sendMsgToEmbeddedWindow(
  msg: OkoWalletMsgOAuthInfoPass,
): Promise<Result<OkoWalletMsg, SendMsgToEmbeddedWindowError>> {
  const attachedURL = window.location.toString();

  // NOTE:
  // As of 2025 Dec, iframe embedded in the host window is the same
  // web application "oko_attached", served from the same URL
  const targetOrigin = new URL(attachedURL).origin;

  for (let idx = 0; idx < window.opener.frames.length; idx += 1) {
    try {
      const frame = window.opener.frames[idx];
      if (frame.location.origin === targetOrigin) {
        try {
          const ack = await sendMsgToWindow(frame, msg, targetOrigin);

          return { success: true, data: ack };
        } catch (err: any) {
          return {
            success: false,
            err: { type: "send_to_parent_fail", error: err.toString() },
          };
        }
      }
    } catch (err: any) {
      console.log(`parent window's iframe not ours, idx: ${idx}`);
    }
  }

  return {
    success: false,
    err: {
      type: "window_not_found",
    },
  };
}
