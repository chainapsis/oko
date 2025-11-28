import type { Result } from "@oko-wallet/stdlib-js";

import type { OAuthValidationFail } from "../types";

export const X_USER_INFO_URL = "https://api.x.com/2/users/me";

export interface XUserInfo {
  id: string;
  name: string;
  username: string;
  email?: string;
}

export async function validateAccessTokenOfX(
  accessToken: string,
): Promise<Result<XUserInfo, OAuthValidationFail>> {
  try {
    const res = await fetch(X_USER_INFO_URL, {
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
