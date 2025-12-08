import type { OkoWalletMsg } from "@oko-wallet/oko-sdk-core";

import type { MsgEventContext } from "./types";
import { handleGetPublicKey } from "./get_public_key";
import { handleSetOAuthNonce } from "./set_oauth_nonce";
import { handleSetCodeVerifier } from "./set_code_verifier";
import { handleOpenModal } from "./open_modal";
import { handleSignOut } from "./sign_out";
import { handleGetEmail } from "./get_email";
import { handleGetCosmosChain } from "./get_cosmos_chain_info";
import { handleOAuthInfoPass } from "./oauth_info_pass";
import { handleGetEthChain } from "./get_eth_chain_info";

export function makeMsgHandler() {
  return async function msgHandler(event: MessageEvent) {
    if (event.ports.length < 1) {
      // do nothing

      return;
    }

    const port = event.ports[0];

    const message = event.data as OkoWalletMsg;

    if (message.target === "oko_attached" || message.target === "oko_sdk") {
      console.debug("[attached] msg recv", event.data);
    } else {
      // do nothing
      return;
    }

    const ctx: MsgEventContext = {
      port,
      hostOrigin: event.origin,
    };

    switch (message.msg_type) {
      case "set_oauth_nonce": {
        handleSetOAuthNonce(ctx, message);
        break;
      }

      case "set_code_verifier": {
        handleSetCodeVerifier(ctx, message);
        break;
      }

      // case "oauth_sign_in":
      //   await handleOAuthSignIn(ctx, message);
      //   break;

      case "get_public_key": {
        await handleGetPublicKey(ctx);
        break;
      }

      case "get_email": {
        await handleGetEmail(ctx);
        break;
      }

      case "open_modal": {
        await handleOpenModal(ctx, message);
        break;
      }

      case "sign_out": {
        await handleSignOut(ctx);
        break;
      }

      case "get_cosmos_chain_info": {
        await handleGetCosmosChain(ctx, message);
        break;
      }

      case "get_eth_chain_info": {
        await handleGetEthChain(ctx, message);
        break;
      }

      case "oauth_info_pass": {
        await handleOAuthInfoPass(ctx, message);
        break;
      }

      default:
        console.error(
          `[attached] unimplemented, msg_type: ${message.msg_type}`,
        );

        throw new Error(`unimplemented, msg_type: ${message.msg_type}`);
    }
  };
}
