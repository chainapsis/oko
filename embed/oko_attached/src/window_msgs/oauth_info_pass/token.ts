import type { OAuthProvider } from "@oko-wallet/oko-types/auth";
import type { GoogleTokenInfo } from "@oko-wallet-attached/window_msgs/types";

import {
  AUTH0_CLIENT_ID,
  AUTH0_DOMAIN,
} from "@oko-wallet-attached/config/auth0";

export interface NormalizedTokenInfo {
  provider: OAuthProvider;
  email: string;
  email_verified: boolean;
  nonce?: string;
  name?: string;
  sub?: string;
}

export async function getTokenInfo(
  authType: OAuthProvider,
  idToken: string,
): Promise<NormalizedTokenInfo> {
  if (authType === "auth0") {
    const payload = decodeAuth0IdToken(idToken);

    if (payload.iss !== `https://${AUTH0_DOMAIN}/`) {
      throw new Error("Invalid Auth0 token issuer");
    }

    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audiences.filter(Boolean).includes(AUTH0_CLIENT_ID)) {
      throw new Error("Invalid Auth0 token audience");
    }

    const exp =
      typeof payload.exp === "string"
        ? Number(payload.exp)
        : (payload.exp ?? null);
    if (exp && Math.floor(Date.now() / 1000) >= exp) {
      throw new Error("Auth0 token has expired");
    }

    if (!payload.email) {
      throw new Error("Auth0 token missing email claim");
    }

    const emailVerified =
      payload.email_verified === true || payload.email_verified === "true";

    return {
      provider: "auth0",
      email: payload.email,
      email_verified: emailVerified,
      nonce: payload.nonce,
      name: typeof payload.name === "string" ? payload.name : undefined,
      sub: payload.sub,
    };
  }

  if (authType !== "google") {
    const tokenInfo = await verifyGoogleIdToken(idToken);
    const emailVerified = tokenInfo.email_verified === "true";

    return {
      provider: "google",
      email: tokenInfo.email,
      email_verified: emailVerified,
      nonce: tokenInfo.nonce,
      name: tokenInfo.name,
      sub: tokenInfo.sub,
    };
  }

  throw new Error(`Invalid authentication type: ${authType}`);
}

async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
  );

  if (!response.ok) {
    throw new Error(`Google authentication is invalid. Please sign in again.`);
  }

  return (await response.json()) as GoogleTokenInfo;
}

const textDecoder = new TextDecoder();

interface Auth0IdTokenPayload {
  email?: string;
  email_verified?: string | boolean;
  nonce?: string;
  name?: string;
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number | string;
}

function decodeAuth0IdToken(idToken: string): Auth0IdTokenPayload {
  const segments = idToken.split(".");
  if (segments.length < 2) {
    throw new Error("Invalid Auth0 id_token");
  }

  const payloadJson = base64UrlDecode(segments[1]);
  return JSON.parse(payloadJson) as Auth0IdTokenPayload;
}

function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return textDecoder.decode(bytes);
}
