export type OAuthProvider = "google" | "auth0";

export type OAuthState = {
  apiKey: string;
  targetOrigin: string;
  provider?: OAuthProvider;
  modalId?: string;
};

export enum RedirectUriSearchParamsKey {
  STATE = "state",
}

export interface OAuthPayload {
  access_token: string;
  id_token: string;
  api_key: string;
  target_origin: string;
  auth_type: OAuthProvider;
}
