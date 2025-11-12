import type { OkoWalletInterface } from "@oko-wallet-sdk-core/types";
import { OKO_ATTACHED_TARGET } from "@oko-wallet-sdk-core/window_msg/target";

export async function startEmailSignIn(
  this: OkoWalletInterface,
  email: string,
): Promise<void> {
  await this.waitUntilInitialized;

  const res = await this.sendMsgToIframe({
    target: OKO_ATTACHED_TARGET,
    msg_type: "auth0_email_send_code",
    payload: { email },
  });

  if (res.msg_type !== "auth0_email_send_code_ack") {
    throw new Error(
      `unexpected message type: ${res.msg_type} (expected auth0_email_send_code_ack)`,
    );
  }

  if (!res.payload.success) {
    throw new Error(res.payload.err ?? "failed to send auth0 email code");
  }
}
