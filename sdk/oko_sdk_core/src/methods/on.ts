import type {
  OkoWalletCoreEventHandler2,
  OkoWalletInterface,
} from "@oko-wallet-sdk-core/types";

export function on(
  this: OkoWalletInterface,
  handlerDef: OkoWalletCoreEventHandler2,
) {
  this.eventEmitter.on(handlerDef);
}
