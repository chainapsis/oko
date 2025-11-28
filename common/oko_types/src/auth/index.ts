export interface TokenResult {
  token: string;
}

export type OAuthProvider = "google" | "auth0" | "x" | "telegram";

export type OAuthRequest<T> = {
  auth_type: OAuthProvider;
} & T;
