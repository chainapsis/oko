import type {
  OkoWalletMsgOAuthInfoPass,
  OAuthSignInError,
} from "@oko-wallet/oko-sdk-core";
import type { OAuthProvider } from "@oko-wallet/oko-types/auth";
import type { CheckEmailResponse } from "@oko-wallet/oko-types/user";

import { checkUserExists } from "./user";
import { getTokenInfo, type NormalizedTokenInfo } from "./token";

interface AppState {
  getHostOriginList(): string[];
  getNonce(origin: string): string | null;
  setApiKey(origin: string, apiKey: string): void;
}

export interface OAuthRequestContext {
  hostOrigin: string;
  authType: OAuthProvider;
  idToken: string;
  tokenInfo: NormalizedTokenInfo;
  userExists: CheckEmailResponse;
}

export async function buildRequestContext(
  appState: AppState,
  message: OkoWalletMsgOAuthInfoPass,
): Promise<OAuthRequestContext> {
  if (message.msg_type !== "oauth_info_pass") {
    throw <OAuthSignInError>{
      type: "invalid_msg_type",
      msg_type: message.msg_type,
    };
  }

  const hostOrigin = message.payload.target_origin;
  if (!appState.getHostOriginList().includes(hostOrigin)) {
    throw <OAuthSignInError>{ type: "origin_not_registered" };
  }

  const nonceRegistered = appState.getNonce(hostOrigin);
  if (!nonceRegistered) {
    throw <OAuthSignInError>{ type: "nonce_missing" };
  }

  const authType: OAuthProvider = message.payload.auth_type ?? "google";
  const idToken = message.payload.id_token;

  const tokenInfo = await getTokenInfo(authType, idToken);
  if (tokenInfo.nonce !== nonceRegistered) {
    throw <OAuthSignInError>{ type: "vendor_token_verification_failed" };
  }

  const apiKey = message.payload.api_key;
  if (!apiKey) {
    throw <OAuthSignInError>{ type: "api_key_missing" };
  }
  appState.setApiKey(hostOrigin, apiKey);

  const userExistsRes = await checkUserExists(tokenInfo.email);
  if (!userExistsRes.success) {
    throw <OAuthSignInError>{
      type: "check_user_request_fail",
      error: userExistsRes.err.toString(),
    };
  }

  const userExistsResp = userExistsRes.data;
  if (!userExistsResp.success) {
    throw <OAuthSignInError>{
      type: "check_user_request_fail",
      error: userExistsResp.msg,
    };
  }

  return {
    hostOrigin,
    authType,
    idToken,
    tokenInfo,
    userExists: userExistsResp.data,
  };
}
