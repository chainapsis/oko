import type { AuthType } from "@oko-wallet/oko-types/auth";

export interface OAuthBody {
  auth_type: AuthType;
}

export interface OAuthUser {
  type: AuthType;
  email: string;
  // `x` is username, `telegram` is username
  name?: string;
}

export interface OAuthLocals {
  oauth_user: OAuthUser;
}
