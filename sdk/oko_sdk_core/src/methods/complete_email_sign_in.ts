import type {
  OkoWalletInterface,
  OkoWalletMsg,
  OkoWalletMsgOAuthSignInUpdate,
  OAuthState,
} from "@oko-wallet-sdk-core/types";
import { OKO_ATTACHED_TARGET } from "@oko-wallet-sdk-core/window_msg/target";

export async function completeEmailSignIn(
  this: OkoWalletInterface,
  email: string,
  code: string,
): Promise<void> {
  await this.waitUntilInitialized;

  const result = await tryAuth0EmailSignIn(
    email,
    code,
    this.sdkEndpoint,
    this.apiKey,
    this.sendMsgToIframe.bind(this),
  );

  if (!result.payload.success) {
    throw new Error(result.payload.err.type);
  }
}

async function tryAuth0EmailSignIn(
  email: string,
  code: string,
  sdkEndpoint: string,
  apiKey: string,
  sendMsgToIframe: (msg: OkoWalletMsg) => Promise<OkoWalletMsg>,
): Promise<OkoWalletMsgOAuthSignInUpdate> {
  const baseUrl = new URL(sdkEndpoint);
  const attachedOrigin = baseUrl.origin;
  const redirectUri = `${attachedOrigin}/auth0/callback`;

  console.debug("[oko] Auth0 email sign in");
  console.debug("[oko] redirectUri: %s", redirectUri);

  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const nonceAckPromise = sendMsgToIframe({
    target: OKO_ATTACHED_TARGET,
    msg_type: "set_oauth_nonce",
    payload: nonce,
  });

  const oauthState: OAuthState & { email: string; provider: string } = {
    apiKey,
    targetOrigin: window.location.origin,
    email,
    provider: "auth0_email",
  };
  const oauthStateString = JSON.stringify(oauthState);

  console.debug("[oko] oauthStateString: %s", oauthStateString);

  const popupUrl = new URL(`${attachedOrigin}/auth0/popup`);
  popupUrl.searchParams.set("email", email);
  popupUrl.searchParams.set("code", code);
  popupUrl.searchParams.set("nonce", nonce);
  popupUrl.searchParams.set("state", oauthStateString);

  const popup = window.open(
    popupUrl.toString(),
    "auth0_email_oauth",
    "width=500,height=600",
  );

  if (!popup) {
    throw new Error("Failed to open new window for Auth0 email sign in");
  }

  const ack = await nonceAckPromise;
  if (ack.msg_type !== "set_oauth_nonce_ack" || !ack.payload.success) {
    throw new Error("Failed to set nonce for Auth0 email sign in");
  }

  return new Promise<OkoWalletMsgOAuthSignInUpdate>((resolve, reject) => {
    let timeout: number;

    function cleanup() {
      window.removeEventListener("message", onMessage);
      if (timeout) {
        clearTimeout(timeout);
      }
    }

    function onMessage(event: MessageEvent) {
      if (event.ports.length < 1) {
        return;
      }

      const port = event.ports[0];
      const data = event.data as OkoWalletMsg;

      if (data.msg_type === "oauth_sign_in_update") {
        console.log("[oko] oauth_sign_in_update recv, %o", data);

        const msg: OkoWalletMsg = {
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
      reject(new Error("Timeout waiting for Auth0 email sign in"));
    }, 300000); // 5 minutes
  });
}
