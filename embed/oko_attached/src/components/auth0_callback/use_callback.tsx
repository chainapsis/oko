"use client";

import { useEffect, useState } from "react";
import type { Result } from "@oko-wallet/stdlib-js";
import type {
  EmailLoginModalApproveAckPayload,
  EmailLoginModalErrorAckPayload,
  OAuthPayload,
  OAuthState,
} from "@oko-wallet/oko-sdk-core";
import type { Auth0DecodedHash } from "auth0-js";

import { getAuth0WebAuth } from "@oko-wallet-attached/config/auth0";
import type { HandleCallbackError } from "@oko-wallet-attached/components/google_callback/types";
import { sendOAuthPayloadToEmbeddedWindow } from "@oko-wallet-attached/components/oauth_callback/send_oauth_payload";

const EMAIL_STORAGE_KEY = "oko_email_login_pending_email";

type OAuthStateWithModal = OAuthState & { modalId?: string };

export function useAuth0Callback(): { error: string | null } {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fn() {
      try {
        const cbRes = await handleAuth0Callback();

        if (cbRes.success) {
          window.close();
        } else {
          throw new Error(cbRes.err.type);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }

    fn().then();
  }, []);

  return { error };
}

export async function handleAuth0Callback(): Promise<
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

  const parsedHash = await parseAuth0Hash();
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname + window.location.search,
  );

  const accessToken = parsedHash.accessToken;
  const idToken = parsedHash.idToken;
  const stateString = parsedHash.state;

  const searchParams = new URLSearchParams(window.location.search);
  const modalIdFromQuery = searchParams.get("modal_id");
  const hostOriginFromQuery = searchParams.get("host_origin");

  if (!accessToken || !idToken || !stateString) {
    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  let oauthState: OAuthStateWithModal;
  try {
    oauthState = JSON.parse(stateString) as OAuthState;
  } catch (error) {
    console.error("[attached] Failed to parse Auth0 state", error);
    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  if (!oauthState.apiKey || !oauthState.targetOrigin) {
    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  if (!oauthState.modalId && modalIdFromQuery) {
    oauthState.modalId = modalIdFromQuery;
  }
  if (!oauthState.targetOrigin && hostOriginFromQuery) {
    oauthState.targetOrigin = hostOriginFromQuery;
  }

  if (!oauthState.modalId) {
    console.error("[attached] Missing modalId for Auth0 callback");
    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  const payload: OAuthPayload = {
    access_token: accessToken,
    id_token: idToken,
    api_key: oauthState.apiKey,
    target_origin: oauthState.targetOrigin,
    auth_type: oauthState.provider ?? "auth0",
  };

  const email = consumePendingEmail() ?? "";
  const sendRes = await sendOAuthPayloadToEmbeddedWindow(payload);
  if (!sendRes.success) {
    notifySDKWithError(oauthState, describeCallbackError(sendRes.err));
    return sendRes;
  }

  notifySDKWithSuccess(oauthState, email);
  return { success: true, data: void 0 };
}

async function parseAuth0Hash(): Promise<Auth0DecodedHash> {
  const hash = window.location.hash;

  if (!hash || hash.length < 2) {
    throw new Error("Missing callback parameters.");
  }

  const webAuth = getAuth0WebAuth();

  return await new Promise<Auth0DecodedHash>((resolve, reject) => {
    webAuth.parseHash({ hash }, (err, result) => {
      if (err) {
        reject(
          new Error(
            err.error_description ??
              err.description ??
              err.error ??
              "Auth0 callback error",
          ),
        );
        return;
      }

      if (!result || !result.idToken) {
        reject(new Error("Missing id_token in callback"));
        return;
      }

      resolve(result);
    });
  });
}

function notifySDKWithSuccess(oauthState: OAuthStateWithModal, email: string) {
  if (!window.opener) {
    console.error("[Auth0Callback] Cannot notify SDK: opener missing");
    return;
  }

  if (!oauthState.modalId || !oauthState.targetOrigin) {
    console.error("[Auth0Callback] Cannot notify SDK: oauth state incomplete");
    return;
  }

  const payload: EmailLoginModalApproveAckPayload = {
    modal_type: "auth/email_login",
    modal_id: oauthState.modalId,
    type: "approve",
    data: {
      email,
    },
  };

  console.log("[attached] notifySDKWithError: %o", payload);

  window.opener.postMessage(
    {
      target: "oko_sdk",
      msg_type: "open_modal_ack",
      payload,
    },
    oauthState.targetOrigin,
  );
}

function notifySDKWithError(oauthState: OAuthStateWithModal, message: string) {
  if (!window.opener) {
    console.error("[Auth0Callback] Cannot notify SDK: opener missing");
    return;
  }

  if (!oauthState.modalId || !oauthState.targetOrigin) {
    console.error("[Auth0Callback] Cannot notify SDK: oauth state incomplete");
    return;
  }

  const payload: EmailLoginModalErrorAckPayload = {
    modal_type: "auth/email_login",
    modal_id: oauthState.modalId,
    type: "error",
    error: {
      type: "verification_failed",
      message,
    },
  };

  window.opener.postMessage(
    {
      target: "oko_sdk",
      msg_type: "open_modal_ack",
      payload,
    },
    oauthState.targetOrigin,
  );
}

function consumePendingEmail(): string | null {
  try {
    const value = window.sessionStorage.getItem(EMAIL_STORAGE_KEY);
    if (value) {
      window.sessionStorage.removeItem(EMAIL_STORAGE_KEY);
      return value;
    }
  } catch {
    // ignore
  }
  return null;
}

function describeCallbackError(error: HandleCallbackError): string {
  switch (error.type) {
    case "msg_pass_fail":
      return `Failed to deliver login result: ${error.error}`;
    case "wrong_ack_type":
      return `Unexpected response type: ${error.msg_type}`;
    default:
      return error.type;
  }
}
