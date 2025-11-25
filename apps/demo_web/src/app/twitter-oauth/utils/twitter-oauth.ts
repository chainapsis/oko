export const TWITTER_CLIENT_ID = "cGFZYW1iQ3JvVldfV1lVMnF6anQ6MTpjaQ";
export const REDIRECT_URI = "http://localhost:3200/twitter-oauth/callback";
export const TWITTER_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
export const TWITTER_TOKEN_URL = "https://api.x.com/2/oauth2/token";

export const TWITTER_SCOPES = [
  "tweet.read",
  "users.read",
  "users.email",
  "offline.access", // Required for refresh_token
].join(" ");

export async function startTwitterLogin() {
  // 1. Generate PKCE code
  const { codeVerifier, codeChallenge } = await createPkcePair();

  // 2. Generate state (CSRF protection)
  const state = generateRandomString(32);

  // 3. Store code_verifier/state in localStorage
  localStorage.setItem("twitter_code_verifier", codeVerifier);
  localStorage.setItem("twitter_state", state);

  // 4. Construct authorize URL
  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: TWITTER_SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const url = `${TWITTER_AUTH_URL}?${params.toString()}`;

  // 5. Redirect
  window.location.href = url;
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}> {
  const response = await fetch("/api/twitter-oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    }
    throw new Error(`Token exchange failed: ${errorMessage}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}> {
  const response = await fetch("/api/twitter-oauth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    }
    throw new Error(`Token refresh failed: ${errorMessage}`);
  }

  return response.json();
}

export type TwitterUserInfo = {
  id: string;
  name: string;
  username: string;
  email?: string;
};

export async function getTwitterUserInfo(
  accessToken: string,
): Promise<TwitterUserInfo> {
  const response = await fetch("/api/twitter-oauth/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    }
    throw new Error(`Failed to get user info: ${errorMessage}`);
  }

  return response.json();
}

async function sha256(input: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateRandomString(length = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => ("0" + b.toString(16)).slice(-2))
    .join("");
}

export async function createPkcePair() {
  const codeVerifier = generateRandomString(64);
  const hash = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hash);
  return { codeVerifier, codeChallenge };
}
