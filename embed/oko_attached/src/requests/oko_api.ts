import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { Result } from "@oko-wallet/stdlib-js";

import type { FetchError } from "./types";
import { OKO_API_ENDPOINT } from "./endpoints";

export const TSS_V1_ENDPOINT = `${OKO_API_ENDPOINT}/tss/v1`;
export const SOCIAL_LOGIN_V1_ENDPOINT = `${OKO_API_ENDPOINT}/social-login/v1`;

export async function makeOkoApiRequest<T, R>(
  path: string,
  args: T,
): Promise<Result<OkoApiResponse<R>, FetchError>> {
  let resp;
  try {
    resp = await fetch(`${TSS_V1_ENDPOINT}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
  } catch (err: any) {
    return { success: false, err: err.toString() };
  }

  if (!resp.ok) {
    return {
      success: false,
      err: { type: "status_fail", status: resp.status },
    };
  }

  try {
    const result = (await resp.json()) as OkoApiResponse<R>;
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, err: err.toString() };
  }
}

export async function makeAuthorizedOkoApiRequest<T, R>(
  path: string,
  idToken: string,
  args: T,
  baseUrl: string = TSS_V1_ENDPOINT,
): Promise<Result<OkoApiResponse<R>, FetchError>> {
  let resp;
  try {
    resp = await fetch(`${baseUrl}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
  } catch (err: any) {
    return { success: false, err: err };
  }

  if (!resp.ok) {
    return {
      success: false,
      err: { type: "status_fail", status: resp.status },
    };
  }

  try {
    const result = (await resp.json()) as OkoApiResponse<R>;
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, err: err };
  }
}
