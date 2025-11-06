import type {
  AdminLoginResponse,
  AdminLogoutResponse,
} from "@oko-wallet/ewallet-types/admin";
import type { OkoApiResponse } from "@oko-wallet/ewallet-types/api_response";

import { OKO_ADMIN_API_ENDPOINT_V1 } from "@oko-wallet-admin/fetch";
import { errorHandle } from "@oko-wallet-admin/fetch/utils";

export const postLoginAdmin = async (email: string, password: string) => {
  return errorHandle<AdminLoginResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/user/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }),
  );
};

export const postLogoutAdmin = async (
  token?: string,
): Promise<OkoApiResponse<AdminLogoutResponse>> => {
  return errorHandle<AdminLogoutResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/user/logout`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
