import type { EWalletMsgGetPublicKeyAck } from "@oko-wallet/oko-sdk-core";

import { EWALLET_SDK_TARGET } from "./target";
import { useAppState } from "@oko-wallet-attached/store/app";
import type { MsgEventContext } from "./types";

export async function handleGetPublicKey(ctx: MsgEventContext) {
  const { port, hostOrigin } = ctx;
  const wallet = useAppState.getState().getWallet(hostOrigin);

  let payload: EWalletMsgGetPublicKeyAck["payload"];
  if (wallet?.publicKey) {
    payload = {
      success: true,
      data: wallet.publicKey,
    };
  } else {
    payload = {
      success: false,
      err: "No public key found",
    };
  }

  const ack: EWalletMsgGetPublicKeyAck = {
    target: EWALLET_SDK_TARGET,
    msg_type: "get_public_key_ack",
    payload,
  };

  port.postMessage(ack);
}
