import { X_USER_INFO_URL } from "@oko-wallet-social-login-api/constants/x";

export async function getXUserInfo(accessToken: string) {
  return await fetch(X_USER_INFO_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
