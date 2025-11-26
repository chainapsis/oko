import type auth0 from "auth0-js";

import { AUTH0_CONNECTION } from "@oko-wallet-attached/config/auth0";

export interface SendEmailOTPCodeParams {
  webAuth: auth0.WebAuth;
  email: string;
}

export function sendEmailOTPCode({ webAuth, email }: SendEmailOTPCodeParams) {
  return new Promise<void>((resolve, reject) => {
    webAuth.passwordlessStart(
      {
        connection: AUTH0_CONNECTION,
        email,
        send: "code",
      },
      (err) => {
        if (err) {
          reject(new Error(formatAuth0Error(err)));
          return;
        }

        resolve();
      },
    );
  });
}

export interface VerifyEmailOTPCodeParams {
  webAuth: auth0.WebAuth;
  email: string;
  verificationCode: string;
  callbackUrl: string;
  nonce: string;
  state: string;
  onError?: (error: Error) => void;
}

export function verifyEmailOTPCode({
  webAuth,
  email,
  verificationCode,
  callbackUrl,
  nonce,
  state,
  onError,
}: VerifyEmailOTPCodeParams) {
  webAuth.passwordlessLogin(
    {
      connection: AUTH0_CONNECTION,
      email,
      verificationCode,
      redirectUri: callbackUrl,
      responseType: "token id_token",
      scope: "openid profile email",
      nonce,
      state,
    },
    (err) => {
      if (err) {
        onError?.(new Error(formatAuth0Error(err)));
      }
    },
  );
}

function formatAuth0Error(error: auth0.Auth0Error) {
  return (
    error?.error_description ??
    error?.description ??
    error?.error ??
    "Auth0 request failed"
  );
}
