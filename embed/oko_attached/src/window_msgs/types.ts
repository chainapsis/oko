import type { AuthType } from "@oko-wallet/oko-types/auth";

export interface MsgEventContext {
  port: MessagePort;
  hostOrigin: string;
}

export interface GoogleTokenInfo {
  alg: string;
  at_hash: string;
  aud: string;
  azp: string;
  email: string;
  email_verified: string;
  exp: string;
  family_name: string;
  given_name: string;
  hd: string;
  iat: string;
  iss: string;
  jti: string;
  kid: string;
  name: string;
  nbf: string;
  nonce: string;
  picture: string;
  sub: string;
  typ: string;
}

export interface XUserInfo {
  id: string;
  name: string;
  username: string;
  email?: string;
}

export interface DiscordUserInfo {
  id: string;
  username: string;
  discriminator: string;
  email: string;
  verified?: boolean;
  avatar?: string;
  global_name?: string;
}

export interface Auth0TokenInfo {
  email: string;
  email_verified: boolean;
  nonce: string;
  name: string;
  sub: string;
  iss: string;
  aud: string | string[];
  exp: number;
}

export interface TokenInfo {
  provider: AuthType;
  user_identifier: string;
}

export interface UserSignInResult {
  publicKey: string;
  walletId: string;
  jwtToken: string;
  keyshare_1: string;
  isNewUser: boolean;
  name: string | null;
}
