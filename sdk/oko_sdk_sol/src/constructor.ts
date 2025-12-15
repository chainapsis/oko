import type { OkoWalletInterface } from "@oko-wallet/oko-sdk-core";

import type {
  OkoSolWalletInterface,
  OkoSolWalletStaticInterface,
} from "./types";
import { lazyInit } from "./private/lazy_init";

export const OkoSolWallet = function (
  this: OkoSolWalletInterface,
  okoWallet: OkoWalletInterface,
) {
  this.okoWallet = okoWallet;
  this.state = {
    publicKey: null,
    publicKeyRaw: null,
  };
  this.publicKey = null;
  this.connecting = false;
  this.connected = false;
  this.waitUntilInitialized = lazyInit(this).then();
} as unknown as OkoSolWalletStaticInterface;
