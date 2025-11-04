import { useEffect, useState } from "react";
import type { Result } from "@oko-wallet/stdlib-js";
import type {
  OkoWalletMsg,
  OkoWalletMsgOAuthInfoPass,
  OAuthPayload,
} from "@oko-wallet/oko-sdk-core";
import { RedirectUriSearchParamsKey } from "@oko-wallet/oko-sdk-core";

import type {
  HandleCallbackError,
  SendMsgToEmbeddedWindowError,
} from "./types";
import { sendMsgToWindow } from "@oko-wallet-attached/window_msgs/send";
import { postLog } from "@oko-wallet-attached/requests/logging";
import { errorToLog } from "@oko-wallet-attached/logging/error";

export function useGoogleCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fn() {
      try {
        const cbRes = await handleGoogleCallback();

        if (cbRes.success) {
          window.close();
        }
      } catch (err) {
        postLog({
          level: "error",
          message: "Google callback error",
          error: errorToLog(err),
        });

        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }

    fn().then();
  }, []);

  return { error };
}

export async function handleGoogleCallback(): Promise<
  Result<void, HandleCallbackError>
> {
  if (!window.opener) {
    return {
      success: false,
      err: {
        type: "opener_window_not_exists",
      },
    };
  }

  const params = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = params.get("access_token");
  const idToken = params.get("id_token");

  const oauthState = getOAuthStateFromUrl();

  const apiKey: string = oauthState.apiKey;
  const targetOrigin: string = oauthState.targetOrigin;

  if (accessToken && idToken && targetOrigin && apiKey) {
    const payload: OAuthPayload = {
      access_token: accessToken,
      id_token: idToken,
      api_key: apiKey,
      target_origin: targetOrigin,
    };

    const msg: OkoWalletMsg = {
      target: "oko_attached",
      msg_type: "oauth_info_pass",
      payload,
    };

    const sendRes = await sendMsgToEmbeddedWindow(msg);

    if (!sendRes.success) {
      console.error("[attached] send oauth result fail, err: %o", sendRes.err);

      return {
        success: false,
        err: { type: "msg_pass_fail", error: sendRes.err.type },
      };
    }

    const ack = sendRes.data;

    if (ack.msg_type !== "oauth_info_pass_ack") {
      console.error("[attached] wrong oauth sign in result ack msg type");

      return {
        success: false,
        err: { type: "wrong_ack_type", msg_type: ack.msg_type },
      };
    }
  } else {
    console.error("[attached] Params not sufficient");

    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  return { success: true, data: void 0 };
}

function getOAuthStateFromUrl() {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const oauthState = JSON.parse(
    params.get(RedirectUriSearchParamsKey.STATE) || "{}",
  );
  return oauthState;
}

// NOTE: This msg needs to bypass host window. If this is not forbidden,
// whether because of the browser policy or the option in response header,
// we may later opt in to communicating via Keplr server orchestration
async function sendMsgToEmbeddedWindow(
  msg: OkoWalletMsgOAuthInfoPass,
): Promise<Result<OkoWalletMsg, SendMsgToEmbeddedWindowError>> {
  const attachedURL = window.location.toString();
  const targetOrigin = new URL(attachedURL).origin;

  try {
    for (let idx = 0; idx < window.opener.frames.length; idx += 1) {
      const frame = window.opener.frames[idx];
      if (frame.location.origin === targetOrigin) {
        const ack = await sendMsgToWindow(frame, msg, targetOrigin);

        return { success: true, data: ack };
      }
    }

    return {
      success: false,
      err: {
        type: "window_not_found",
      },
    };
  } catch (err: any) {
    return {
      success: false,
      err: { type: "unknown", error: err.toString() },
    };
  }
}
