import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
import type { SignInSilentlyResponse } from "@oko-wallet/ewallet-types/user";
import type { OkoWalletMsgInit } from "@oko-wallet/oko-sdk-core";
import type { Theme } from "@oko-wallet/ewallet-common-ui/theme";

import { initKeplrWasm } from "@oko-wallet-attached/wasm";
import { useMemoryState } from "@oko-wallet-attached/store/memory";
import { useAppState } from "@oko-wallet-attached/store/app";
import { makeAuthorizedOkoApiRequest } from "@oko-wallet-attached/requests/oko_api";
import { determineTheme, setColorScheme } from "./color_scheme";
import { makeMsgHandler } from "@oko-wallet-attached/window_msgs";
import {
  errorToLog,
  initErrorLogging,
} from "@oko-wallet-attached/logging/error";
import { postLog } from "@oko-wallet-attached/requests/logging";
import { sendMsgToWindow } from "@oko-wallet-attached/window_msgs/send";
import { setUserId } from "@oko-wallet-attached/analytics/amplitude";

export function useInitializeApp() {
  const { setHostOrigin } = useMemoryState();
  const { getAuthToken, getWallet, setAuthToken, setTheme, getTheme } =
    useAppState();
  const [isHydrated, setIsHydrated] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const unsubscribe = useAppState.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    if (useAppState.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    const msgHandler = makeMsgHandler();

    console.debug("[attached] adding msg event listener");
    window.addEventListener("message", msgHandler);

    return () => {
      window.removeEventListener("message", msgHandler);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      console.log("[attached] not hydrated, waiting for hydration");
      return;
    }

    async function fn() {
      try {
        initErrorLogging();

        await initKeplrWasm();

        const searchParams = new URLSearchParams(window.location.search);

        const hostOrigin = searchParams.get("host_origin");
        if (hostOrigin === null) {
          const msg: OkoWalletMsgInit = {
            target: "oko_sdk",
            msg_type: "init",
            payload: {
              success: false,
              err: "Host origin missing in searchParams",
            },
          };

          await sendMsgToWindow(window.parent, msg, "*");

          return;
        }

        setHostOrigin(hostOrigin);

        const authToken = getAuthToken(hostOrigin);
        await silentlyRefreshAuthToken(authToken, hostOrigin, setAuthToken);

        const oldTheme = getTheme(hostOrigin);
        const _theme = await determineTheme(hostOrigin, oldTheme);
        setTheme(hostOrigin, _theme);
        setColorScheme(_theme);

        console.log(
          "[attached] old theme: %s, resolved theme: %s",
          oldTheme,
          resolvedTheme,
        );
        setResolvedTheme(_theme);

        const wallet = getWallet(hostOrigin);
        const email = wallet?.email;
        const publicKey = wallet?.publicKey;

        if (wallet?.walletId) {
          setUserId(wallet.walletId);
        }

        const initMsg: OkoWalletMsgInit = {
          target: "oko_sdk",
          msg_type: "init",
          payload: {
            success: true,
            data: {
              public_key: publicKey ?? null,
              email: email ?? null,
            },
          },
        };

        await sendInitMsg(hostOrigin, initMsg);
        console.log("[attached] init success, wallet: %s", wallet?.email);
      } catch (err: any) {
        postLog(
          {
            level: "error",
            message: "[attached] error initializing app",
            error: errorToLog(err),
          },
          { console: true },
        );

        const initErrorMsg: OkoWalletMsgInit = {
          target: "oko_sdk",
          msg_type: "init",
          payload: {
            success: false,
            err: err.message,
          },
        };
        sendInitMsg("*", initErrorMsg);
      }
    }

    fn().then();
  }, [getAuthToken, setAuthToken, isHydrated]);

  return { theme: resolvedTheme };
}

function sendInitMsg(hostOrigin: string, msg: OkoWalletMsgInit) {
  console.log(`[attached] sending init msg, payload: %o`, msg.payload);

  return sendMsgToWindow(window.parent, msg, hostOrigin);
}

async function silentlyRefreshAuthToken(
  authToken: string | null,
  hostOrigin: string,
  setAuthToken: (hostOrigin: string, token: string | null) => void,
) {
  if (authToken) {
    const res = await makeAuthorizedOkoApiRequest<any, SignInSilentlyResponse>(
      "user/signin_silently",
      authToken,
      {
        token: authToken,
      },
    );

    if (!res.success) {
      console.error("Error logging in, err: %s", res.err);
      return;
    }

    const resp = res.data;
    if (resp.success) {
      if (resp.data.token !== null) {
        console.log("[attached] refreshing auth token");

        setAuthToken(hostOrigin, resp.data.token);
      }
    }
  }
}
