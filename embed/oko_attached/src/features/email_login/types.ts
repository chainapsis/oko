export interface EmailLoginRequestArgs {
  email: string;
  hostOrigin: string;
}

export interface EmailLoginVerifyArgs {
  email: string;
  code: string;
  hostOrigin: string;
}

export interface EmailLoginVerificationResult {
  email: string;
  walletId: string;
  publicKey: string;
  authToken: string;
  keyshare_1: string;
}
