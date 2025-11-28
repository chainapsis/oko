import type { Result } from "@oko-wallet/stdlib-js";
import type { SocialLoginXVerifyUserResponse } from "@oko-wallet/oko-types/social_login";

import { X_USER_INFO_URL } from "@oko-wallet-social-login-api/constants/x";

export async function getXUserInfo(accessToken: string): Promise<
  Result<
    SocialLoginXVerifyUserResponse,
    {
      status: number;
      text: string;
    }
  >
> {
  const res = await fetch(X_USER_INFO_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.ok) {
    return {
      success: true,
      data: (await res.json()).data,
    };
  }

  return {
    success: false,
    err: {
      status: res.status,
      text: await res.text(),
    },
  };
}
