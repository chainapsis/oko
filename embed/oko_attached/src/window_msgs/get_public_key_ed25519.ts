import type { OkoWalletMsgGetPublicKeyEd25519Ack } from "@oko-wallet/oko-sdk-core";

import { OKO_SDK_TARGET } from "./target";
import { useAppState } from "@oko-wallet-attached/store/app";
import type { MsgEventContext } from "./types";

export async function handleGetPublicKeyEd25519(ctx: MsgEventContext) {
  const { port, hostOrigin } = ctx;
  const keyPackageEd25519 = useAppState.getState().getKeyPackageEd25519(hostOrigin);

  let payload: OkoWalletMsgGetPublicKeyEd25519Ack["payload"];
  if (keyPackageEd25519?.publicKey) {
    payload = {
      success: true,
      data: keyPackageEd25519.publicKey,
    };
  } else {
    payload = {
      success: false,
      err: "No Ed25519 public key found",
    };
  }

  const ack: OkoWalletMsgGetPublicKeyEd25519Ack = {
    target: OKO_SDK_TARGET,
    msg_type: "get_public_key_ed25519_ack",
    payload,
  };

  port.postMessage(ack);
}
