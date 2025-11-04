import { EwalletApiResponse } from "@oko-wallet/ewallet-types/api_response";

import { useAppState } from "@oko-wallet-ct-dashboard/state";

function checkIsTokenInvalid(errorCode: string, status: number) {
  // TODO 이후 token 만료시 적절한 code를 보내서 수정 필요
  return errorCode === "INVALID_TOKEN" || status === 401;
}

let resetTimeout: NodeJS.Timeout | null = null;

// TODO: @elden
// rework
export async function errorHandle<T>(
  fetchCall: () => Promise<Response>,
): Promise<EwalletApiResponse<T>> {
  try {
    const response = await fetchCall();
    const data = await response.json();

    if (!response.ok || !data.success) {
      if (checkIsTokenInvalid(data.code, response.status)) {
        if (resetTimeout) {
          clearTimeout(resetTimeout);
        }

        resetTimeout = setTimeout(() => {
          useAppState.getState().resetUser();
          resetTimeout = null;
        }, 100);

        return {
          success: false,
          msg: data.msg,
          code: data.code,
        };
      }

      return {
        success: false,
        msg: data.msg || "request signing in failed",
        code: data.code,
      };
    }

    return data satisfies EwalletApiResponse<T>;
  } catch (error) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unknown error occurred";
    }

    return { success: false, msg: errorMessage, code: "UNKNOWN_ERROR" };
  }
}
