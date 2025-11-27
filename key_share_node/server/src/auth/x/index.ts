import type { Result } from "@oko-wallet/stdlib-js";

import type { OAuthValidationFail } from "../types";

export interface XUserInfo {
  id: string;
  name: string;
  username: string;
}

export async function validateAccessTokenOfX(
  accessToken: string,
): Promise<Result<XUserInfo, OAuthValidationFail>> {
  try {
    const okoApiEndpoint = process.env.OKO_API_ENDPOINT;

    if (!okoApiEndpoint) {
      return {
        success: false,
        err: {
          type: "unknown",
          message: "OKO_API_ENDPOINT is not set",
        },
      };
    }

    const res = await fetch(`${okoApiEndpoint}/social-login/v1/x/verify-user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      return {
        success: false,
        err: {
          type: "invalid_token",
          message: "Invalid or malformed token",
        },
      };
    }
    const tokenInfo = await res.json();

    return {
      success: true,
      data: tokenInfo.data,
    };
  } catch (error: any) {
    return {
      success: false,
      err: {
        type: "unknown",
        message: `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
}
