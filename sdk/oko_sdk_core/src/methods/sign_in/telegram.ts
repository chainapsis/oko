import type {
  OAuthState,
  OkoWalletInterface,
  OkoWalletMsg,
  OkoWalletMsgOAuthSignInUpdate,
  OkoWalletMsgOAuthSignInUpdateAck,
} from "@oko-wallet-sdk-core/types";
import { RedirectUriSearchParamsKey } from "@oko-wallet-sdk-core/types/oauth";

const FIVE_MINS_MS = 5 * 60 * 1000;
const TELEGRAM_BOT_NAME = "auth234198_bot";

export async function handleTelegramSignIn(okoWallet: OkoWalletInterface) {
  const signInRes = await tryTelegramSignIn(
    okoWallet.sdkEndpoint,
    okoWallet.apiKey,
    okoWallet.sendMsgToIframe.bind(okoWallet),
  );

  if (!signInRes.payload.success) {
    throw new Error(`sign in fail, err: ${signInRes.payload.err}`);
  }
}

async function tryTelegramSignIn(
  sdkEndpoint: string,
  apiKey: string,
  sendMsgToIframe: (msg: OkoWalletMsg) => Promise<OkoWalletMsg>,
): Promise<OkoWalletMsgOAuthSignInUpdate> {
  const redirectUri = `${new URL(sdkEndpoint).origin}/telegram/callback`;

  console.debug("[oko] Telegram login - window host: %s", window.location.host);
  console.debug("[oko] Telegram login - redirectUri: %s", redirectUri);

  const oauthState: OAuthState = {
    apiKey,
    targetOrigin: window.location.origin,
    provider: "telegram",
  };
  const oauthStateString = JSON.stringify(oauthState);

  console.debug(
    "[oko] Telegram login - oauthStateString: %s",
    oauthStateString,
  );

  const telegramLoginUrl = new URL(`${new URL(sdkEndpoint).origin}/telegram`);
  telegramLoginUrl.searchParams.set(
    RedirectUriSearchParamsKey.STATE,
    oauthStateString,
  );

  const popup = window.open(
    telegramLoginUrl.toString(),
    "telegram_oauth",
    "width=500,height=600",
  );

  if (!popup) {
    throw new Error("Failed to open new window for telegram oauth sign in");
  }

  return new Promise<OkoWalletMsgOAuthSignInUpdate>((resolve, reject) => {
    let timeout: number;

    function onMessage(event: MessageEvent) {
      if (event.ports.length < 1) {
        return;
      }

      const port = event.ports[0];
      const data = event.data as OkoWalletMsg;

      if (data.msg_type === "oauth_sign_in_update") {
        console.log(
          "[oko] Telegram login - oauth_sign_in_update recv, %o",
          data,
        );

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
      console.log("[oko] Telegram login - clean up oauth sign in listener");
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
