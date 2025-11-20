import { v4 as uuidv4 } from "uuid";

import { OKO_ATTACHED_TARGET } from "@oko-wallet-sdk-core/window_msg/target";
import type {
  OAuthState,
  OkoWalletInterface,
  OkoWalletMsg,
  OkoWalletMsgOAuthSignInUpdate,
  OkoWalletMsgOAuthSignInUpdateAck,
  OkoWalletMsgOpenModal,
} from "@oko-wallet-sdk-core/types";

import { generateNonce } from "./utils";

const FIVE_MINS_MS = 5 * 60 * 1000;

export async function handleEmailSignIn(okoWallet: OkoWalletInterface) {
  const signInRes = await tryAuth0EmailSignIn(okoWallet);

  if (!signInRes.payload.success) {
    throw new Error(
      `sign in fail, err: ${signInRes.payload.err?.type ?? "unknown"}`,
    );
  }
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

