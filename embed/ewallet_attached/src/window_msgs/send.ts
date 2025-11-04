import type { EWalletMsg } from "@oko-wallet/oko-sdk-core";

import { EWALLET_SDK_TARGET } from "./target";

export function sendMsgToWindow(
  window: Window,
  msg: EWalletMsg,
  targetOrigin: string,
) {
  return new Promise<EWalletMsg>((resolve) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (obj: any) => {
      const data = obj.data as EWalletMsg;

      channel.port1.close();

      if (data.hasOwnProperty("payload")) {
        resolve(data);
      } else {
        resolve({
          target: EWALLET_SDK_TARGET,
          msg_type: "unknown_msg_type",
          payload: JSON.stringify(data),
        });
      }
    };

    window.postMessage(msg, targetOrigin, [channel.port2]);
  });
}
