import type { OkoWalletInterface } from "@oko-wallet-sdk-core/types";
import { OKO_ATTACHED_TARGET } from "@oko-wallet-sdk-core/window_msg/target";

export async function signOut(this: OkoWalletInterface) {
  await this.waitUntilInitialized;

  await this.sendMsgToIframe({
    target: OKO_ATTACHED_TARGET,
    msg_type: "sign_out",
    payload: null,
  });

  this.eventEmitter.emit({
    type: "CORE__accountsChanged",
    email: null,
    publicKey: null,
  });
}
