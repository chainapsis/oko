import type {
  AdminLoginResponse,
  AdminLogoutResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";

import { OKO_ADMIN_API_ENDPOINT_V1 } from "@oko-wallet-admin/fetch";
import { doFetch } from "@oko-wallet-admin/fetch/fetcher";

export async function postLoginAdmin(email: string, password: string) {
  return doFetch<AdminLoginResponse>(
    `${OKO_ADMIN_API_ENDPOINT_V1}/user/login`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );
}

export async function postLogoutAdmin(
  token?: string,
): Promise<OkoApiResponse<AdminLogoutResponse>> {
  return doFetch<AdminLogoutResponse>(
    `${OKO_ADMIN_API_ENDPOINT_V1}/user/logout`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
