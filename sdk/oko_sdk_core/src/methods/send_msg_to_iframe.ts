import type {
  OkoWalletMsg,
  OkoWalletInterface,
} from "@oko-wallet-sdk-core/types";

export async function sendMsgToIframe(
  this: OkoWalletInterface,
  msg: OkoWalletMsg,
): Promise<OkoWalletMsg> {
  await this.waitUntilInitialized;

  const contentWindow = this.iframe.contentWindow;
  if (contentWindow === null) {
    throw new Error("iframe contentWindow is null");
  }

  return new Promise<OkoWalletMsg>((resolve) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (event: MessageEvent) => {
      const data = event.data as OkoWalletMsg;

      console.debug("[oko] reply recv", data);

      if (Object.prototype.hasOwnProperty.call(data, "payload")) {
        resolve(data);
      } else {
        console.error("[oko] unknown msg type");
        resolve({
          target: "oko_sdk",
          msg_type: "unknown_msg_type",
          payload: JSON.stringify(data),
        });
      }
    };

    contentWindow.postMessage(msg, this.sdkEndpoint, [channel.port2]);
  });
}
