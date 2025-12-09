import { lazyInit } from "./private/lazy_init";
import type {
  OkoWalletCoreEvent2,
  OkoWalletCoreEventHandler2,
  OkoWalletInterface,
  OkoWalletStaticInterface,
} from "./types";
import { EventEmitter3 } from "./event";
import pJson from "../package.json";

export const OkoWallet = function (
  this: OkoWalletInterface,
  apiKey: string,
  iframe: HTMLIFrameElement,
  sdkEndpoint: string,
) {
  console.log(4, pJson.version);

  this.apiKey = apiKey;
  this.iframe = iframe;
  this.activePopupId = null;
  this.activePopupWindow = null;
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
