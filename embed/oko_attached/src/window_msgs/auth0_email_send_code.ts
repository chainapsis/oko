import type {
  OkoWalletMsgAuth0EmailSendCode,
  OkoWalletMsgAuth0EmailSendCodeAck,
} from "@oko-wallet/oko-sdk-core";

import { OKO_SDK_TARGET } from "./target";
import type { MsgEventContext } from "./types";
import { sendAuth0EmailCode } from "@oko-wallet-attached/lib/auth0";

export async function handleAuth0EmailSendCode(
  ctx: MsgEventContext,
  message: OkoWalletMsgAuth0EmailSendCode,
) {
  const { port } = ctx;

  let payload: OkoWalletMsgAuth0EmailSendCodeAck["payload"];

  try {
    const email = message.payload.email?.trim();

    if (!email) {
      throw new Error("Email is required for Auth0 email sign in");
    }

    await sendAuth0EmailCode(email);

    payload = {
      success: true,
      data: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error ?? "Unknown error");

    payload = {
      success: false,
      err: errorMessage,
    };
  }

  const ack: OkoWalletMsgAuth0EmailSendCodeAck = {
    target: OKO_SDK_TARGET,
    msg_type: "auth0_email_send_code_ack",
    payload,
  };

  port.postMessage(ack);
}


