import { v4 as uuidv4 } from "uuid";

import { OKO_ATTACHED_TARGET } from "@oko-wallet-sdk-core/window_msg/target";
import type {
  OkoWalletInterface,
  OAuthState,
  OkoWalletMsg,
  OkoWalletMsgOAuthSignInUpdateAck,
  OkoWalletMsgOAuthSignInUpdate,
  OkoWalletMsgOpenModal,
} from "@oko-wallet-sdk-core/types";
import { RedirectUriSearchParamsKey } from "@oko-wallet-sdk-core/types/oauth";
import { GOOGLE_CLIENT_ID } from "@oko-wallet-sdk-core/auth/google";

const FIVE_MINS_MS = 5 * 60 * 1000;

export async function signIn(
  this: OkoWalletInterface,
  type: "google" | "email",
) {
  await this.waitUntilInitialized;

  try {
    switch (type) {
      case "google": {
        await handleGoogleSignIn(this);
        break;
      }
      case "email": {
        await handleEmailSignIn(this);
        break;
      }
      default:
        throw new Error(`not supported sign in type, type: ${type}`);
    }
  } catch (err) {
    throw new Error(`Sign in error, err: ${err}`);
  }

  const publicKey = await this.getPublicKey();
  const email = await this.getEmail();

  if (!!publicKey && !!email) {
    console.log("[oko] emit CORE__accountsChanged");

    this.eventEmitter.emit({
      type: "CORE__accountsChanged",
      email,
      publicKey,
    });
  }
}

async function handleGoogleSignIn(okoWallet: OkoWalletInterface) {
  const signInRes = await tryGoogleSignIn(
    okoWallet.sdkEndpoint,
    okoWallet.apiKey,
    okoWallet.sendMsgToIframe.bind(okoWallet),
  );

  if (!signInRes.payload.success) {
    throw new Error(`sign in fail, err: ${signInRes.payload.err}`);
  }
}

async function handleEmailSignIn(okoWallet: OkoWalletInterface) {
  const signInRes = await tryAuth0EmailSignIn(okoWallet);

  if (!signInRes.payload.success) {
    throw new Error(
      `sign in fail, err: ${signInRes.payload.err?.type ?? "unknown"}`,
    );
  }
}

function generateNonce() {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function tryAuth0EmailSignIn(
  okoWallet: OkoWalletInterface,
): Promise<OkoWalletMsgOAuthSignInUpdate> {
  const nonce = generateNonce();

  const nonceAckPromise = okoWallet.sendMsgToIframe({
    target: OKO_ATTACHED_TARGET,
    msg_type: "set_oauth_nonce",
    payload: nonce,
  });

  const modalId = uuidv4();

  const oauthState: OAuthState = {
    apiKey: okoWallet.apiKey,
    targetOrigin: window.location.origin,
    provider: "auth0",
    modalId,
  };
  const oauthStateString = JSON.stringify(oauthState);

  console.debug("[oko] oauthStateString: %s", oauthStateString);

  const nonceAck = await nonceAckPromise;
  if (
    nonceAck.msg_type !== "set_oauth_nonce_ack" ||
    !nonceAck.payload.success
  ) {
    throw new Error("Failed to set nonce for email oauth sign in");
  }

  const modalMsg: OkoWalletMsgOpenModal = {
    target: OKO_ATTACHED_TARGET,
    msg_type: "open_modal",
    payload: {
      modal_type: "auth/email_login",
      modal_id: modalId,
      data: {
        email_hint: null,
        oauth: {
          nonce,
          state: oauthStateString,
        },
      },
    },
  };

  const oauthSignInUpdateWaiter = waitForOAuthSignInUpdate(okoWallet);

  const result = await okoWallet.openModal(modalMsg);
  console.log("[oko] open modal result: %o", result);
  if (!result.success) {
    oauthSignInUpdateWaiter.cancel();
    throw new Error(result.err.type);
  }

  return await oauthSignInUpdateWaiter.promise;
}

async function tryGoogleSignIn(
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
    target: OKO_ATTACHED_TARGET,
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

  // Google implicit auth flow
  // See https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
  authUrl.searchParams.set("response_type", "token id_token");

  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("prompt", "login");
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set(RedirectUriSearchParamsKey.STATE, oauthStateString);

  // NOTE: Safari browser sets a strict rule in the amount of time a script
  // can handle function that involes window.open(). window.open() should be
  // executed without awaiting any long operations (1000ms limit at the time
  // of writing)
  const popup = window.open(
    authUrl.toString(),
    "google_oauth",
    "width=1200,height=800",
  );

  if (!popup) {
    throw new Error("Failed to open new window for google oauth sign in");
  }

  const ack = await nonceAckPromise;
  if (ack.msg_type !== "set_oauth_nonce_ack" || !ack.payload.success) {
    throw new Error("Failed to set nonce for google oauth sign in");
  }

  return new Promise<OkoWalletMsgOAuthSignInUpdate>(async (resolve, reject) => {
    // let focusTimer: number;
    let timeout: number;

    // function onFocus(e: FocusEvent) {
    //   // when user focus back to the parent window, check if the popup is closed
    //   // a small delay to handle the case message is sent but not received yet
    //   focusTimer = window.setTimeout(() => {
    //     if (popup && popup.closed) {
    //       cleanup();
    //       reject(new Error("Window closed by user"));
    //       closePopup(popup);
    //     }
    //   }, 200);
    // }
    // window.addEventListener("focus", onFocus);

    // This takes "oauth result msg" from the sign-in popup window
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

    timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timeout: no response within 5 minutes"));
      closePopup(popup);
    }, FIVE_MINS_MS);

    function cleanup() {
      console.log("[oko] clean up oauth sign in listener");

      // window.clearTimeout(focusTimer);
      // window.removeEventListener("focus", onFocus);

      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
    }
  });
}

function closePopup(popup: Window) {
  if (popup && !popup.closed) {
    popup.close();
  }
}

function waitForOAuthSignInUpdate(okoWallet: OkoWalletInterface) {
  let cleanup: (() => void) | null = null;

  const promise = new Promise<OkoWalletMsgOAuthSignInUpdate>(
    (resolve, reject) => {
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

          cleanup?.();
          cleanup = null;
        }
      }

      window.addEventListener("message", onMessage);

      const timeout = window.setTimeout(() => {
        cleanup?.();
        cleanup = null;
        reject(new Error("Timeout: no response within 5 minutes"));
        okoWallet.closeModal();
      }, FIVE_MINS_MS);

      cleanup = () => {
        console.log("[oko] clean up oauth sign in listener");
        window.clearTimeout(timeout);
        window.removeEventListener("message", onMessage);
      };
    },
  );

  return {
    promise,
    cancel: () => {
      cleanup?.();
      cleanup = null;
    },
  };
}
