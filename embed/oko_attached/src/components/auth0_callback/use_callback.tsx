"use client";

import { useEffect, useState } from "react";
import type { Result } from "@oko-wallet/stdlib-js";
import type { OAuthPayload, OAuthState } from "@oko-wallet/oko-sdk-core";
import type { Auth0DecodedHash } from "auth0-js";

import { getAuth0WebAuth } from "@oko-wallet-attached/config/auth0";
import type { HandleCallbackError } from "@oko-wallet-attached/components/google_callback/types";
import { sendOAuthPayloadToEmbeddedWindow } from "@oko-wallet-attached/components/oauth_callback/send_oauth_payload";

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

  if (!accessToken || !idToken || !stateString) {
    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  let oauthState: OAuthState;
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

  const payload: OAuthPayload = {
    access_token: accessToken,
    id_token: idToken,
    api_key: oauthState.apiKey,
    target_origin: oauthState.targetOrigin,
    auth_type: oauthState.provider ?? "auth0",
  };

  const sendRes = await sendOAuthPayloadToEmbeddedWindow(payload);
  if (!sendRes.success) {
    return sendRes;
  }

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
