import type {
  OAuthSignInError,
  OAuthPayload,
  OAuthTokenRequestPayload,
  OAuthTokenRequestPayloadOfTelegram,
  OAuthTokenRequestPayloadOfX,
  OAuthTokenRequestPayloadOfDiscord,
} from "@oko-wallet/oko-sdk-core";
import type { Result } from "@oko-wallet/stdlib-js";

import { verifyIdToken } from "./token";
import { getAccessTokenOfX } from "./x";
import { getAccessTokenOfDiscordWithPKCE } from "./discord";
import { useAppState } from "@oko-wallet-attached/store/app";

type OAuthCredentialResult = Result<
  { idToken: string; userIdentifier: string },
  OAuthSignInError
>;

async function validateOAuthPayloadOfX(
  payload: OAuthTokenRequestPayloadOfX,
  hostOrigin: string,
): Promise<OAuthCredentialResult> {
  const appState = useAppState.getState();

  const codeVerifierRegistered = appState.getCodeVerifier(hostOrigin);
  if (!codeVerifierRegistered) {
    return {
      success: false,
      err: {
        type: "PKCE_missing",
      },
    };
  }

  const tokenRes = await getAccessTokenOfX(
    payload.code,
    codeVerifierRegistered,
  );

  if (!tokenRes.success) {
    return {
      success: false,
      err: {
        type: "unknown",
        error: tokenRes.err,
      },
    };
  }

  const verifyIdTokenRes = await verifyIdToken("x", tokenRes.data);
  if (!verifyIdTokenRes.success) {
    return {
      success: false,
      err: {
        type: "unknown",
        error: verifyIdTokenRes.err,
      },
    };
  }

  const userInfo = verifyIdTokenRes.data;
  const tokenInfo = tokenRes.data;

  appState.setCodeVerifier(hostOrigin, null);

  return {
    success: true,
    data: {
      idToken: tokenInfo,
      userIdentifier: userInfo.email,
    },
  };
}

async function validateOAuthPayloadOfTelegram(
  payload: OAuthTokenRequestPayloadOfTelegram,
): Promise<OAuthCredentialResult> {
  if (!payload.telegram_data?.id) {
    return {
      success: false,
      err: {
        type: "unknown",
        error: "params_not_sufficient",
      },
    };
  }

  return {
    success: true,
    data: {
      idToken: JSON.stringify(payload.telegram_data),
      userIdentifier: payload.telegram_data.id,
    },
  };
}

async function validateOAuthPayloadOfDiscord(
  payload: OAuthTokenRequestPayloadOfDiscord,
  hostOrigin: string,
): Promise<OAuthCredentialResult> {
  const appState = useAppState.getState();
  const codeVerifierRegistered = appState.getCodeVerifier(hostOrigin);
  if (!codeVerifierRegistered) {
    return {
      success: false,
      err: { type: "PKCE_missing" },
    };
  }

  const redirectUri = `${window.location.origin}/discord/callback`;

  const tokenRes = await getAccessTokenOfDiscordWithPKCE(
    payload.code,
    codeVerifierRegistered,
    redirectUri,
  );

  if (!tokenRes.success) {
    return {
      success: false,
      err: { type: "unknown", error: tokenRes.err },
    };
  }

  const verifyIdTokenRes = await verifyIdToken("discord", tokenRes.data);
  if (!verifyIdTokenRes.success) {
    return {
      success: false,
      err: { type: "unknown", error: verifyIdTokenRes.err },
    };
  }

  const userInfo = verifyIdTokenRes.data;
  if (!userInfo.email) {
    return {
      success: false,
      err: { type: "unknown", error: "Discord email not found" },
    };
  }

  appState.setCodeVerifier(hostOrigin, null);

  return {
    success: true,
    data: {
      idToken: tokenRes.data,
      userIdentifier: userInfo.email,
    },
  };
}

async function validateOAuthPayload(
  payload: OAuthPayload,
  hostOrigin: string,
): Promise<OAuthCredentialResult> {
  const appState = useAppState.getState();
  const nonceRegistered = appState.getNonce(hostOrigin);

  if (!nonceRegistered) {
    return {
      success: false,
      err: { type: "nonce_missing" },
    };
  }

  const tokenInfoRes = await verifyIdToken(
    payload.auth_type,
    payload.id_token,
    nonceRegistered,
  );

  if (!tokenInfoRes.success) {
    return {
      success: false,
      err: { type: "vendor_token_verification_failed" },
    };
  }

  const tokenInfo = tokenInfoRes.data;
  return {
    success: true,
    data: {
      idToken: payload.id_token,
      userIdentifier: tokenInfo.email,
    },
  };
}

export async function getCredentialsFromPayload(
  payload: OAuthPayload | OAuthTokenRequestPayload,
  hostOrigin: string,
): Promise<OAuthCredentialResult> {
  switch (payload.auth_type) {
    case "x":
      return validateOAuthPayloadOfX(payload, hostOrigin);
    case "telegram":
      return validateOAuthPayloadOfTelegram(payload);
    case "discord":
      return validateOAuthPayloadOfDiscord(payload, hostOrigin);
    case "google":
    case "auth0":
      return validateOAuthPayload(payload, hostOrigin);
  }
}
