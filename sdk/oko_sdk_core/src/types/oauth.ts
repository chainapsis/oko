export type OAuthProvider = "google" | "auth0" | "x" | "telegram" | "discord";

export type OAuthState = {
  apiKey: string;
  targetOrigin: string;
  provider: OAuthProvider;
  modalId?: string;
  codeVerifier?: string;
};

export enum RedirectUriSearchParamsKey {
  STATE = "state",
}

export interface OAuthPayload {
  access_token: string;
  id_token: string;
  api_key: string;
  target_origin: string;
  auth_type: "google" | "auth0";
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
}

export interface OAuthTokenRequestPayloadOfDiscord {
  code: string;
  api_key: string;
  target_origin: string;
  auth_type: "discord";
}

export interface OAuthTokenRequestPayloadOfTelegram {
  telegram_data: Record<string, string>;
  api_key: string;
  target_origin: string;
  auth_type: "telegram";
}
