import type { Result } from "@oko-wallet/stdlib-js";

import type { DiscordUserInfo } from "@oko-wallet-attached/window_msgs/types";

const DISCORD_CLIENT_ID = "1445280712121913384";
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";

export async function getAccessTokenOfDiscordWithPKCE(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<Result<string, string>> {
  try {
    const reqBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      client_id: DISCORD_CLIENT_ID,
      code_verifier: codeVerifier,
    });

    const response = await fetch(DISCORD_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: reqBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[discord] Token exchange failed: %s %s",
        response.status,
        errorText,
      );
      return {
        success: false,
        err: `Token exchange failed: ${response.status} ${errorText}`,
      };
    }

    const result = await response.json();

    if (!result.access_token) {
      return {
        success: false,
        err: "No access_token in response",
      };
    }

    return { success: true, data: result.access_token };
  } catch (err: any) {
    console.error("[discord] getAccessTokenOfDiscordWithPKCE error: %o", err);
    return { success: false, err: err.toString() };
  }
}

export async function verifyIdTokenOfDiscord(
  accessToken: string,
): Promise<Result<DiscordUserInfo, string>> {
  try {
    const response = await fetch("https://discord.com/api/users/@me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[discord] Failed to get user info: %s %s",
        response.status,
        errorText,
      );
      return {
        success: false,
        err: `Failed to get user info: ${response.status} ${errorText}`,
      };
    }

    const result = await response.json();
    if (!result.id) {
      return {
        success: false,
        err: "Discord id not found",
      };
    }

    const userInfo: DiscordUserInfo = {
      id: result.id,
      username: result.username,
      discriminator: result.discriminator,
      email: result.email,
      verified: result.verified,
      avatar: result.avatar,
      global_name: result.global_name,
    };

    return { success: true, data: userInfo };
  } catch (err: any) {
    console.error("[discord] verifyIdTokenOfDiscord error: %o", err);
    return { success: false, err: err.toString() };
  }
}
