import type { OkoWalletMsg } from "@oko-wallet/oko-sdk-core";

import { OKO_SDK_TARGET } from "./target";

export function sendMsgToWindow(
  window: Window,
  msg: OkoWalletMsg,
  targetOrigin: string,
) {
  return new Promise<OkoWalletMsg>((resolve) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (obj: any) => {
      const data = obj.data as OkoWalletMsg;

      channel.port1.close();

      if (data.hasOwnProperty("payload")) {
        resolve(data);
      } else {
        resolve({
          target: OKO_SDK_TARGET,
          msg_type: "unknown_msg_type",
          payload: JSON.stringify(data),
        });
      }
    };

    window.postMessage(msg, targetOrigin, [channel.port2]);
  });
}
