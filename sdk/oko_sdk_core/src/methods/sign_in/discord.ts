import type {
  OAuthState,
  OkoWalletInterface,
  OkoWalletMsg,
  OkoWalletMsgOAuthSignInUpdate,
  OkoWalletMsgOAuthSignInUpdateAck,
} from "@oko-wallet-sdk-core/types";
import { RedirectUriSearchParamsKey } from "@oko-wallet-sdk-core/types/oauth";
import { DISCORD_CLIENT_ID } from "@oko-wallet-sdk-core/auth/discord";

const FIVE_MINS_MS = 5 * 60 * 1000;
const DISCORD_SCOPES = ["identify", "email"].join(" ");

export async function handleDiscordSignIn(okoWallet: OkoWalletInterface) {
  const signInRes = await tryDiscordSignIn(
    okoWallet.sdkEndpoint,
    okoWallet.apiKey,
  );

  if (!signInRes.payload.success) {
    throw new Error(`sign in fail, err: ${signInRes.payload.err}`);
  }
}

async function tryDiscordSignIn(
  sdkEndpoint: string,
  apiKey: string,
): Promise<OkoWalletMsgOAuthSignInUpdate> {
  const clientId = DISCORD_CLIENT_ID;
  if (!clientId) {
    throw new Error("DISCORD_CLIENT_ID is not set");
  }

  const redirectUri = `${new URL(sdkEndpoint).origin}/discord/callback`;

  console.debug("[oko] Discord login - window host: %s", window.location.host);
  console.debug("[oko] Discord login - redirectUri: %s", redirectUri);

  const oauthState: OAuthState = {
    apiKey,
    targetOrigin: window.location.origin,
    provider: "discord",
  };

  const oauthStateString = btoa(JSON.stringify(oauthState));

  console.debug("[oko] Discord login - oauthStateString: %s", oauthStateString);

  // Build the Discord auth URL
  const authUrl = new URL("https://discord.com/api/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", DISCORD_SCOPES);
  authUrl.searchParams.set(RedirectUriSearchParamsKey.STATE, oauthStateString);

  // Open popup for Discord OAuth
  const popup = window.open(
    authUrl.toString(),
    "discord_oauth",
    "width=1200,height=800",
  );

  if (!popup) {
    throw new Error("Failed to open new window for Discord oauth sign in");
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
          "[oko] Discord login - oauth_sign_in_update recv, %o",
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
      console.log("[oko] Discord login - clean up oauth sign in listener");
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
