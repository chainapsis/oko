import { useEffect, useState } from "react";
import type { Result } from "@oko-wallet/stdlib-js";
import { RedirectUriSearchParamsKey } from "@oko-wallet/oko-sdk-core";

import type { HandleTelegramCallbackError } from "./types";
import { postLog } from "@oko-wallet-attached/requests/logging";
import { errorToLog } from "@oko-wallet-attached/logging/error";
import { sendOAuthPayloadToEmbeddedWindow } from "@oko-wallet-attached/components/oauth_callback/send_oauth_payload";

export function useTelegramCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fn() {
      try {
        const cbRes = await handleTelegramCallback();

        if (cbRes.success) {
          window.close();
        } else {
          setError(cbRes.err.type);
        }
      } catch (err) {
        postLog({
          level: "error",
          message: "Telegram callback error",
          error: errorToLog(err),
        });

        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }

    fn().then();
  }, []);

  return { error };
}

export async function handleTelegramCallback(): Promise<
  Result<void, HandleTelegramCallbackError>
> {
  if (!window.opener) {
    return {
      success: false,
      err: {
        type: "opener_window_not_exists",
      },
    };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const stateParam = urlParams.get(RedirectUriSearchParamsKey.STATE) || "{}";

  if (!stateParam) {
    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  let oauthState;
  try {
    oauthState = JSON.parse(stateParam);
  } catch (err) {
    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  const apiKey: string = oauthState.apiKey;
  const targetOrigin: string = oauthState.targetOrigin;

  if (!apiKey || !targetOrigin) {
    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  const telegramData: Record<string, string> = {};
  for (const [key, value] of urlParams.entries()) {
    if (key !== RedirectUriSearchParamsKey.STATE && value !== null) {
      telegramData[key] = value;
    }
  }

  if (!telegramData.id || !telegramData.auth_date || !telegramData.hash) {
    return {
      success: false,
      err: { type: "params_not_sufficient" },
    };
  }

  const payload = {
    telegram_data: {
      ...telegramData,
    },
    api_key: apiKey,
    target_origin: targetOrigin,
    auth_type: "telegram" as const,
  };

  const sendRes = await sendOAuthPayloadToEmbeddedWindow(payload);

  if (!sendRes.success) {
    console.error(
      "[attached] send telegram oauth result fail, err: %o",
      sendRes.err,
    );
    return sendRes;
  }

  return { success: true, data: void 0 };
}
