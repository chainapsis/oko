import auth0 from "auth0-js";
import type { OkoWalletMsgAuth0EmailSendCode } from "@oko-wallet/oko-sdk-core";

import type { MsgEventContext } from "../types";

const AUTH0_DOMAIN = "dev-0v00qjwpomau3ldk.us.auth0.com";
const AUTH0_CLIENT_ID = "AMtmlNKxJiNY7abqewmq9mjERf2TOlfo";

const webAuth = new auth0.WebAuth({
  domain: AUTH0_DOMAIN,
  clientID: AUTH0_CLIENT_ID,
  responseType: "token id_token",
  scope: "openid profile email",
});

export async function handleAuth0EmailSendCode(
  ctx: MsgEventContext,
  message: OkoWalletMsgAuth0EmailSendCode,
) {
  const { email } = message.payload;

  try {
    await new Promise<void>((resolve, reject) => {
      webAuth.passwordlessStart(
        {
          connection: "email",
          email,
          send: "code",
        },
        (err: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        },
      );
    });

    ctx.port.postMessage({
      target: "oko_sdk",
      msg_type: "auth0_email_send_code_ack",
      payload: {
        success: true,
        data: null,
      },
    });
  } catch (err: any) {
    ctx.port.postMessage({
      target: "oko_sdk",
      msg_type: "auth0_email_send_code_ack",
      payload: {
        success: false,
        err:
          err?.description ??
          err?.error_description ??
          err?.message ??
          "failed to send auth0 email code",
      },
    });
  }
}
