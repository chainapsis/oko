import type { SocialLoginXVerifyUserResponse } from "@oko-wallet/oko-types/social_login";
import { getXUserInfo } from "@oko-wallet/social-login-api";
import type { Result } from "@oko-wallet/stdlib-js";

export async function validateAccessTokenOfX(
  accessToken: string,
): Promise<Result<SocialLoginXVerifyUserResponse, string>> {
  try {
    const res = await getXUserInfo(accessToken);
    if (!res.success) {
      if (res.err.status === 429) {
        return {
          success: false,
          err: "Too Many Requests",
        };
      }
      return {
        success: false,
        err: `Invalid token: ${res.err.text}`,
      };
    }

    return {
      success: true,
      data: res.data,
    };
  } catch (error: any) {
    return {
      success: false,
      err: `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
