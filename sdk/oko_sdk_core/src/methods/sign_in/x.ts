import type {
  OAuthState,
  OkoWalletInterface,
  OkoWalletMsg,
  OkoWalletMsgOAuthSignInUpdate,
  OkoWalletMsgOAuthSignInUpdateAck,
} from "@oko-wallet-sdk-core/types";
import { RedirectUriSearchParamsKey } from "@oko-wallet-sdk-core/types/oauth";
import { X_CLIENT_ID } from "@oko-wallet-sdk-core/auth/x";
import { createPkcePair } from "./utils";

const FIVE_MINS_MS = 5 * 60 * 1000;
const X_SCOPES = ["tweet.read", "users.read", "offline.access"].join(" ");

export async function handleXSignIn(okoWallet: OkoWalletInterface) {
  const signInRes = await tryXSignIn(
    okoWallet.sdkEndpoint,
    okoWallet.apiKey,
    okoWallet.sendMsgToIframe.bind(okoWallet),
  );

  if (!signInRes.payload.success) {
    throw new Error(`sign in fail, err: ${signInRes.payload.err}`);
  }
}

function tryXSignIn(
  sdkEndpoint: string,
  apiKey: string,
  sendMsgToIframe: (msg: OkoWalletMsg) => Promise<OkoWalletMsg>,
): Promise<OkoWalletMsgOAuthSignInUpdate> {
  const clientId = X_CLIENT_ID;
  if (!clientId) {
    throw new Error("X_CLIENT_ID is not set");
  }

  const redirectUri = `${new URL(sdkEndpoint).origin}/x/callback`;

  console.debug("[oko] X login - window host: %s", window.location.host);
  console.debug("[oko] X login - redirectUri: %s", redirectUri);

  const oauthState: OAuthState = {
    apiKey,
    targetOrigin: window.location.origin,
    provider: "x",
  };

  // https://devcommunity.x.com/t/redirect-url-receiving-state-parameter-with-some-characters-stripped-out/170092/13
  // If the provider is X and the state is an object,
  // there is an issue where encoding disappears when the state is passed to
  // the callback. Therefore, only in this case, send it encoded as base64.
  const oauthStateString = btoa(JSON.stringify(oauthState));
  console.debug("[oko] X login - oauthStateString: %s", oauthStateString);

  // NOTE:
  // Open popup immediately to avoid Safari popup blocker
  // Use a blank page first, then redirect after PKCE is ready
  const popup = window.open("about:blank", "x_oauth", "width=1200,height=800");

  if (!popup) {
    throw new Error("Failed to open new window for X oauth sign in");
  }

  return new Promise<OkoWalletMsgOAuthSignInUpdate>(async (resolve, reject) => {
    const { codeVerifier, codeChallenge } = await createPkcePair();

    const codeVerifierAckPromise = sendMsgToIframe({
      target: "oko_attached",
      msg_type: "set_code_verifier",
      payload: codeVerifier,
    });

    // Build the actual auth URL with PKCE
    const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", X_SCOPES);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set(
      RedirectUriSearchParamsKey.STATE,
      oauthStateString,
    );

    // Redirect popup to actual auth URL
    try {
      popup.location.href = authUrl.toString();
    } catch (error) {
      popup.close();
      throw new Error(
        `Failed to redirect popup to auth URL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const ack = await codeVerifierAckPromise;

    if (ack.msg_type !== "set_code_verifier_ack" || !ack.payload.success) {
      throw new Error("Failed to set code verifier for X oauth sign in");
    }
    let timeout: number;

    function onMessage(event: MessageEvent) {
      if (event.ports.length < 1) {
        return;
      }

      const port = event.ports[0];
      const data = event.data as OkoWalletMsg;

      if (data.msg_type === "oauth_sign_in_update") {
        console.log("[oko] X login - oauth_sign_in_update recv, %o", data);

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
      console.log("[oko] X login - clean up oauth sign in listener");
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
