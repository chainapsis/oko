import type { AuthType } from "@oko-wallet/oko-types/auth";

export type SignInType = "google" | "email" | "x" | "telegram" | "discord";

export type OAuthState = {
  apiKey: string;
  targetOrigin: string;
  provider: AuthType;
  modalId?: string;
  codeVerifier?: string;
  curveType?: CurveType;
};

export enum RedirectUriSearchParamsKey {
  STATE = "state",
}

export type CurveType = "secp256k1" | "ed25519";

export interface OAuthPayload {
  access_token: string;
  id_token: string;
  api_key: string;
  target_origin: string;
  auth_type: AuthType;
  curve_type?: CurveType;
}
export type OAuthTokenRequestPayload =
  | OAuthTokenRequestPayloadOfX
  | OAuthTokenRequestPayloadOfTelegram
  | OAuthTokenRequestPayloadOfDiscord;

export interface OAuthTokenRequestPayloadOfX {
  code: string;
  api_key: string;
  target_origin: string;
  auth_type: "x";
  curve_type?: CurveType;
}

export interface OAuthTokenRequestPayloadOfDiscord {
  code: string;
  api_key: string;
  target_origin: string;
  auth_type: "discord";
  curve_type?: CurveType;
}

export interface OAuthTokenRequestPayloadOfTelegram {
  telegram_data: Record<string, string>;
  api_key: string;
  target_origin: string;
  auth_type: "telegram";
  curve_type?: CurveType;
}
