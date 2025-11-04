import { lazyInit } from "./private/lazy_init";
import type {
  OkoWalletCoreEvent2,
  OkoWalletCoreEventHandler2,
  OkoWalletInterface,
  OkoWalletStaticInterface,
} from "./types";
import { EventEmitter3 } from "./event";

export const OkoWallet = function (
  this: OkoWalletInterface,
  apiKey: string,
  iframe: HTMLIFrameElement,
  sdkEndpoint: string,
) {
  this.apiKey = apiKey;
  this.iframe = iframe;
  this.sdkEndpoint = sdkEndpoint;
  this.origin = window.location.origin;
  this.eventEmitter = new EventEmitter3<
    OkoWalletCoreEvent2,
    OkoWalletCoreEventHandler2
  >();
  this.state = {
    email: null,
    publicKey: null,
  };
  this.waitUntilInitialized = lazyInit(this).then();
} as any as OkoWalletStaticInterface;
