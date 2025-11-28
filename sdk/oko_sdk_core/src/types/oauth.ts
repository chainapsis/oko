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
  auth_type: Extract<OAuthProvider, "google" | "auth0">;
}
export type OAuthTokenRequestPayload =
  | OAuthTokenRequestPayloadOfX
  | OAuthTokenRequestPayloadOfTelegram
  | OAuthTokenRequestPayloadOfDiscord;

interface OAuthTokenRequestPayloadOfX {
  code: string;
  api_key: string;
  target_origin: string;
  auth_type: "x" | "discord";
}

interface OAuthTokenRequestPayloadOfDiscord {
  code: string;
  api_key: string;
  target_origin: string;
  auth_type: "discord";
}

export interface OAuthTokenRequestPayloadOfTelegram {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
  api_key: string;
  target_origin: string;
  auth_type: "telegram";
}

export interface OAuthTokenRequestPayloadOfTelegram {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
  api_key: string;
  target_origin: string;
  auth_type: "telegram";
}
