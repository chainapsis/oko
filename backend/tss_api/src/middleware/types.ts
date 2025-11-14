export interface ResponseLocals {
  oauth_user?: OAuthUser;
}

export interface OAuthUser {
  type: "google" | "auth0";
  email: string;
  name?: string;
  sub: string;
}
