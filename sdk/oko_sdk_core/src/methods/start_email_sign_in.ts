import type {
  OkoWalletInterface,
  OkoWalletMsgAuth0EmailSendCodeAck,
} from "@oko-wallet-sdk-core/types";
import { OKO_ATTACHED_TARGET } from "@oko-wallet-sdk-core/window_msg/target";

export async function startEmailSignIn(
  this: OkoWalletInterface,
  email: string,
): Promise<void> {
  await this.waitUntilInitialized;

  const response = await this.sendMsgToIframe({
    target: OKO_ATTACHED_TARGET,
    msg_type: "auth0_email_send_code",
    payload: {
      email,
    },
  });

  if (response.msg_type !== "auth0_email_send_code_ack") {
    throw new Error(`Unexpected response: ${response.msg_type}`);
  }

  const ack = response as OkoWalletMsgAuth0EmailSendCodeAck;
  if (!ack.payload.success) {
    throw new Error(ack.payload.err);
  }
}
