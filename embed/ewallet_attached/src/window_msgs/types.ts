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

export interface UserSignInResult {
  publicKey: string;
  walletId: string;
  jwtToken: string;
  keyshare_1: string;
}
