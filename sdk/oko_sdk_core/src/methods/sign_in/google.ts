import { GOOGLE_CLIENT_ID } from "@oko-wallet-sdk-core/auth/google";
import type {
  OAuthState,
  OkoWalletInterface,
  OkoWalletMsg,
  OkoWalletMsgOAuthSignInUpdate,
  OkoWalletMsgOAuthSignInUpdateAck,
} from "@oko-wallet-sdk-core/types";
import { RedirectUriSearchParamsKey } from "@oko-wallet-sdk-core/types/oauth";

import { generateNonce } from "./utils";

const FIVE_MINS_MS = 5 * 60 * 1000;

export async function handleGoogleSignIn(okoWallet: OkoWalletInterface) {
  const signInRes = await tryGoogleSignIn(
    okoWallet.sdkEndpoint,
    okoWallet.apiKey,
    okoWallet.sendMsgToIframe.bind(okoWallet),
  );

  if (!signInRes.payload.success) {
    throw new Error(`sign in fail, err: ${signInRes.payload.err}`);
  }
}

// NOTE: Opening popup window should not reside in the async function
// Or at least any async function should not come before window.open()
function tryGoogleSignIn(
  sdkEndpoint: string,
  apiKey: string,
  sendMsgToIframe: (msg: OkoWalletMsg) => Promise<OkoWalletMsg>,
): Promise<OkoWalletMsgOAuthSignInUpdate> {
  const clientId = GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set");
  }

  const redirectUri = `${new URL(sdkEndpoint).origin}/google/callback`;

  console.debug("[oko] window host: %s", window.location.host);
  console.debug("[oko] redirectUri: %s", redirectUri);

  const nonce = generateNonce();

  const nonceAckPromise = sendMsgToIframe({
    target: "oko_attached",
    msg_type: "set_oauth_nonce",
    payload: nonce,
  });

  const oauthState: OAuthState = {
    apiKey,
    targetOrigin: window.location.origin,
    provider: "google",
  };
  const oauthStateString = JSON.stringify(oauthState);

  console.debug("[oko] oauthStateString: %s", oauthStateString);

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "token id_token");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("prompt", "login");
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set(RedirectUriSearchParamsKey.STATE, oauthStateString);

  const popup = window.open(
    authUrl.toString(),
    "google_oauth",
    "width=1200,height=800",
  );

  if (!popup) {
    throw new Error("Failed to open new window for google oauth sign in");
  }

  return new Promise<OkoWalletMsgOAuthSignInUpdate>(async (resolve, reject) => {
    const ack = await nonceAckPromise;
    if (ack.msg_type !== "set_oauth_nonce_ack" || !ack.payload.success) {
      throw new Error("Failed to set nonce for google oauth sign in");
    }

    let popupTimeoutTimer: number;
    let popupCloseCheckTimer: number;

    function onMessage(event: MessageEvent) {
      if (event.ports.length < 1) {
        return;
      }

      const port = event.ports[0];
      const data = event.data as OkoWalletMsg;

      if (data.msg_type === "oauth_sign_in_update") {
        console.log("[oko] oauth_sign_in_update recv, %o", data);

        const msg: OkoWalletMsgOAuthSignInUpdateAck = {
          target: "oko_attached",
          msg_type: "oauth_sign_in_update_ack",
          payload: null,
        };

        port.postMessage(msg);

        if (data.payload.success) {
          resolve(data);
        } else {
          reject(new Error(data.payload.err.type));
        }

        cleanup();
      }
    }

    window.addEventListener("message", onMessage);

    // Check if popup was closed by the user
    popupCloseCheckTimer = window.setInterval(() => {
      if (popup.closed) {
        console.log("[oko] Popup was closed by user, rejecting sign-in");
        cleanup();
        reject(new Error("Sign-in cancelled"));
      }
    }, 500);

    popupTimeoutTimer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timeout: no response within 5 minutes"));
      closePopup(popup);
    }, FIVE_MINS_MS);

    function cleanup() {
      console.log("[oko] clean up oauth sign in listener");
      window.clearTimeout(popupTimeoutTimer);
      window.clearInterval(popupCloseCheckTimer);
      window.removeEventListener("message", onMessage);
    }
  });
}

function closePopup(popup: Window) {
  if (popup && !popup.closed) {
    popup.close();
  }
}
